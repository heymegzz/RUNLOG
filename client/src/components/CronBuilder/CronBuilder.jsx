// CronBuilder component placeholder — visual cron expression builder
// Implement in Phase 5
const CronBuilder = ({ value, onChange }) => {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="* * * * *" />;
};
export default CronBuilder;
