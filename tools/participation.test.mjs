import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=html.match(/function startReady\(\)\{[^\n]+\}/)[0];
const submit=html.slice(html.indexOf('  async function loadResultRanking('),html.indexOf('  function renderRankingShell()'));
function setup(rpc=async()=>[]){
 const elements={rankingList:{textContent:'',children:[]},rankingStatus:{textContent:''}};
 const context=vm.createContext({game:{playerName:'',score:42},playerNameInput:{value:''},STATE:{READY:'ready'},setState(){},localStorage:{setItem(){}},Object,Array,RANKING_CONFIG:{enabled:true,rankingRpc:'get_best_score_ranking',submitRpc:'submit_score',gameSlug:'koroshine',clientVersion:'test'},$:id=>elements[id],callRpc:rpc,renderRankingRows(rows){elements.rankingList.children=rows;elements.rankingList.textContent=rows.map(r=>r.display_name).join(',');}});
 vm.runInContext('let rankingSent=false,rankingFetched=false,rankingGeneration=0,rankingRequest=0;'+start+'\n'+submit+';globalThis.api={startReady,submitAndFetchRankingOnce,loadResultRanking,newPlay:()=>{rankingGeneration++;rankingSent=false;rankingFetched=false;}};',context);
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
 assert.equal(calls.find(c=>c.fn==='submit_score').payload.p_display_name,'Later');
});
test('reopening results and retrying only ranking never duplicates score submission',async()=>{
 const calls=[];const x=setup(async(fn,payload)=>{calls.push({fn,payload});return[];});
 x.context.playerNameInput.value='Name';x.api.startReady();await x.api.submitAndFetchRankingOnce();await x.api.submitAndFetchRankingOnce();await x.api.loadResultRanking();
 assert.equal(calls.filter(c=>c.fn==='submit_score').length,1);
});
test('score failure keeps result value and still loads ranking',async()=>{
 const x=setup(async fn=>{if(fn==='submit_score')throw new Error('offline');return[];});x.context.playerNameInput.value='Name';x.api.startReady();await x.api.submitAndFetchRankingOnce();
 assert.equal(x.context.game.score,42);assert.match(x.elements.rankingStatus.textContent,/保持/);assert.match(x.elements.rankingList.textContent,/記録がありません/);
});
test('old ranking response cannot replace a newer response',async()=>{
 const pending=[];const x=setup(()=>new Promise(resolve=>pending.push(resolve)));
 const old=x.api.loadResultRanking(),recent=x.api.loadResultRanking();pending[1]([{display_name:'new'}]);await recent;pending[0]([{display_name:'old'}]);await old;
 assert.equal(x.elements.rankingList.textContent,'new');
});
