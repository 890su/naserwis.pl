import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizeRuntime } from '../../scripts/localize-runtime.mjs';
import { splitReviewModal } from '../../scripts/review-modal-runtime.mjs';

test('locale builds preserve cross-language navigation and current-language fallback',()=>{
  const code=`const LANG_CONFIG={pl:1,ru:2,uk:3,en:4}; const bannerTexts={pl:1,ru:2,uk:3,en:4};const messages={pl:'fallback',ru:'current',uk:'unused',en:'unused'};return {LANG_CONFIG,bannerTexts,messages};`;
  const output=localizeRuntime(`function fixture(){${code}}`, 'ru');
  const result=new Function(output+';return fixture();')();
  assert.deepEqual(Object.keys(result.LANG_CONFIG),['pl','ru','uk','en']);
  assert.deepEqual(Object.keys(result.bannerTexts),['pl','ru','uk','en']);
  assert.deepEqual(result.messages,{pl:'fallback',ru:'current'});
});

test('page builds retain only their supported intent variants and review functions',()=>{
  const source=`function initReviewModal(){};function initInteractiveStars(){};function initReviewsSlider(){};const INTENT_VARIANTS={pl:{wifi_repair:1,lan_install:2},ru:{wifi_repair:3,lan_install:4},uk:{wifi_repair:5},en:{wifi_repair:6}};initReviewModal();return INTENT_VARIANTS;`;
  const output=localizeRuntime(`function fixture(){${source}}`,'ru',{service:'wifi_repair',hasReviews:false});
  assert.deepEqual(new Function(output+';return fixture();')(),{pl:{wifi_repair:1},ru:{wifi_repair:3}});
  assert.ok(!output.includes('initReviewModal'));
  assert.ok(!output.includes('initInteractiveStars'));
  assert.ok(!output.includes('initReviewsSlider'));
});

test('review extraction retains the original editor inside an on-demand initializer',()=>{
  const source='function initReviewModal(){pushMeasurementEvent("editor");}initReviewModal();';
  const result=splitReviewModal(source);
  assert.ok(result.initial.includes('__REVIEW_MODAL_URL__'));
  assert.ok(!result.initial.includes('pushMeasurementEvent("editor")'));
  assert.ok(result.deferred.includes('pushMeasurementEvent("editor")'));
  assert.ok(result.deferred.includes('window.naserwisReviewModalReady'));
  assert.throws(()=>localizeRuntime(source,'xx'),/Unsupported/);
});
