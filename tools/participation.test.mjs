import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
const {createScoreQueue}=createRequire(import.meta.url)('./score-queue.cjs');
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=html.match(/function startReady\(\)\{[^\n]+\}/)[0];
const queueInit=html.slice(html.indexOf('  let queueStorage=null;'),html.indexOf('  // ---------- 入力配線 ----------'));
const submit=html.slice(html.indexOf('function parseLeaderboard('),html.indexOf('  function renderRankingShell()'));
function setup(rpc=async()=>[]){
 const elements={rankingList:{textContent:'',children:[]},rankingStatus:{textContent:''},submissionRetryBtn:{hidden:true},pendingRetryHome:{hidden:true}};const store=new Map();
 const context=vm.createContext({game:{playerName:'',score:42,floor:3,won:false,finalReason:'リタイア'},playerNameInput:{value:''},STATE:{READY:'ready',RESULT:'result'},state:'result',setState(){},renderResult(){},MAX_FLOOR:40,CommonScoreQueue:{createScoreQueue:options=>createScoreQueue({...options,uuid:randomUUID})},localStorage:{get length(){return store.size},key:i=>[...store.keys()][i],getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},Object,Array,RANKING_CONFIG:{enabled:true,rankingRpc:'get_best_score_ranking',submitRpc:'submit_score_once_shared_v1',gameSlug:'koroshine',clientVersion:'test'},$:id=>elements[id],callRpc:async(fn,p)=>{const raw=await rpc(fn,p);return fn==='submit_score_once_shared_v1'?[{accepted:true,result_display_name:p.p_display_name,result_normalized_name:p.p_display_name,result_first_score:p.p_score,result_best_score:p.p_score,result_play_count:1,was_duplicate:false}]:raw;},renderRankingRows(rows){elements.rankingList.children=rows;elements.rankingList.textContent=rows.map(r=>r.display_name).join(',');}});
 vm.runInContext('let scoreQueue,rankingSent=false,rankingFetched=false,rankingGeneration=0,rankingRequest=0;const RESULT_KEY="test-result";'+start+'\n'+submit+queueInit+';globalThis.api={startReady,submitAndFetchRankingOnce,loadResultRanking,newPlay:()=>{rankingGeneration++;rankingSent=false;rankingFetched=false;}};',context);
 return {context,api:context.api,elements};
}
test('empty or whitespace name can start and reads ranking without submitting',async()=>{
 for(const name of ['', ' \t　 ']){
  const calls=[];const x=setup(async(fn,payload)=>{calls.push({fn,payload});return[];});
  x.context.playerNameInput.value=name;x.api.startReady();await x.api.submitAndFetchRankingOnce();
  assert.deepEqual(calls.map(c=>c.fn),['get_best_score_ranking']);assert.equal(calls[0].payload.p_limit,30);
 }
});
test('result uses the start name and never retroactively sends a guest result',async()=>{
 const calls=[];const x=setup(async(fn,payload)=>{calls.push({fn,payload});return[];});
 x.api.startReady();x.context.playerNameInput.value='Later';await x.api.submitAndFetchRankingOnce();await x.api.submitAndFetchRankingOnce();await x.api.loadResultRanking();
 assert.ok(calls.every(c=>c.fn==='get_best_score_ranking'));
 x.api.newPlay();x.api.startReady();x.context.playerNameInput.value='Changed';await x.api.submitAndFetchRankingOnce();
 assert.equal(calls.find(c=>c.fn==='submit_score_once_shared_v1').payload.p_display_name,'Later');
});
test('reopening results and retrying only ranking never duplicates score submission',async()=>{
 const calls=[];const x=setup(async(fn,payload)=>{calls.push({fn,payload});return[];});
 x.context.playerNameInput.value='Name';x.api.startReady();await x.api.submitAndFetchRankingOnce();await x.api.submitAndFetchRankingOnce();await x.api.loadResultRanking();
 assert.equal(calls.filter(c=>c.fn==='submit_score_once_shared_v1').length,1);
});
test('score failure keeps result value and still loads ranking',async()=>{
 const x=setup(async fn=>{if(fn==='submit_score_once_shared_v1')throw new Error('offline');return[];});x.context.playerNameInput.value='Name';x.api.startReady();await x.api.submitAndFetchRankingOnce();
 assert.equal(x.context.game.score,42);assert.match(x.elements.rankingStatus.textContent,/保持/);assert.match(x.elements.rankingList.textContent,/記録がありません/);
});
test('old ranking response cannot replace a newer response',async()=>{
 const pending=[];const x=setup(()=>new Promise(resolve=>pending.push(resolve)));
 const old=x.api.loadResultRanking(),recent=x.api.loadResultRanking();pending[1]([{rank_no:1,display_name:'new',best_score:42}]);await recent;pending[0]([{rank_no:1,display_name:'old',best_score:42}]);await old;
 assert.equal(x.elements.rankingList.textContent,'new');
});
