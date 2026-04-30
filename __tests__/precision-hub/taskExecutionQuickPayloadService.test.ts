import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildTaskExecutionQuickFeedbackTokens,
  mergeTaskExecutionQuickPayloadNotes,
  parseTaskExecutionQuickPayloadNotes,
} from '@/services/taskExecutionQuickPayloadService'

test('buildTaskExecutionQuickFeedbackTokens captures selected quick outcome and follow-up', () => {
  assert.deepEqual(
    buildTaskExecutionQuickFeedbackTokens({
      outcome: 'attention',
      followUpRequired: true,
    }),
    ['esito attention', 'follow-up richiesto']
  )
})

test('mergeTaskExecutionQuickPayloadNotes appends quick feedback without duplicating tokens', () => {
  assert.equal(
    mergeTaskExecutionQuickPayloadNotes('controllare domani • esito attention', {
      outcome: 'attention',
      followUpRequired: true,
    }),
    'controllare domani • esito attention • follow-up richiesto'
  )
})

test('mergeTaskExecutionQuickPayloadNotes returns undefined when no notes or quick feedback exist', () => {
  assert.equal(mergeTaskExecutionQuickPayloadNotes('', {}), undefined)
})

test('parseTaskExecutionQuickPayloadNotes extracts structured quick feedback from saved notes', () => {
  assert.deepEqual(
    parseTaskExecutionQuickPayloadNotes('osservazione campo • esito critical • follow-up richiesto'),
    {
      outcome: 'critical',
      followUpRequired: true,
    }
  )
})
