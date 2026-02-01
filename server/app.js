const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/teamhealth' });

function computeBurnout(avgFocus, afterPings) {
  const focusScore = Math.min(avgFocus / 5, 1);
  const pingScore = 1 - Math.min(afterPings, 10) / 10;
  return 100 * (0.7 * focusScore + 0.3 * pingScore);
}
function computeVelocity(sprintPct, avgPrIdle) {
  const sprintScore = sprintPct / 100;
  const prScore = 1 - Math.min(avgPrIdle, 72) / 72;
  return 100 * (0.6 * sprintScore + 0.4 * prScore);
}
function computeSentiment(avgPulse) {
  return (avgPulse / 10) * 100;
}
function computeCollaboration(avgCrossMeetings, pctZeroCrossDept) {
  const meetScore = Math.min(avgCrossMeetings / 2, 1);
  const siloScore = 1 - (pctZeroCrossDept / 100);
  return 100 * (0.6 * meetScore + 0.4 * siloScore);
}
function computeTHI(burnout, velocity, sentiment, collaboration, weights = {b:0.35, v:0.25, s:0.2, c:0.2}) {
  return weights.b * burnout + weights.v * velocity + weights.s * sentiment + weights.c * collaboration;
}

app.get('/api/metrics/weekly', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM weekly_metrics ORDER BY week_ending ASC');
  const result = rows.map(r => {
    const burnout = computeBurnout(Number(r.avg_focus), Number(r.avg_after_pings));
    const velocity = computeVelocity(Number(r.sprint_completion_pct), Number(r.avg_pr_idle_hours));
    const sentiment = computeSentiment(Number(r.avg_pulse));
    const collaboration = computeCollaboration(Number(r.avg_cross_dept_meetings), Number(r.pct_zero_cross_dept));
    const thi = computeTHI(burnout, velocity, sentiment, collaboration);
    return {
      week_ending: r.week_ending,
      avg_focus: Number(r.avg_focus),
      avg_after_pings: Number(r.avg_after_pings),
      sprint_completion_pct: Number(r.sprint_completion_pct),
      avg_pr_idle_hours: Number(r.avg_pr_idle_hours),
      avg_pulse: Number(r.avg_pulse),
      pulse_response_pct: Number(r.pulse_response_pct),
      avg_cross_dept_meetings: Number(r.avg_cross_dept_meetings),
      pct_zero_cross_dept: Number(r.pct_zero_cross_dept),
      subscores: { burnout, velocity, sentiment, collaboration },
      thi
    };
  });
  res.json(result);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
