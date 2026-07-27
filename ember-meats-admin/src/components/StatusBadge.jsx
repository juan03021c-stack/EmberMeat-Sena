export function StatusBadge({ status }) { 
  const styles = { 
    Shipped:    'bg-warning bg-opacity-10 text-warning border border-warning', 
    Delivered:  'bg-success bg-opacity-10 text-success border border-success', 
    Processing: 'bg-primary bg-opacity-10 text-primary border border-primary', 
    Pending:    'bg-secondary bg-opacity-10 text-secondary border border-secondary', 
  } 
  return ( 
    <span className={`badge ${styles[status] || 'bg-secondary'}`}> 
      {status} 
    </span> 
  ) }
