export default function Badge({title, color}) {
  return(
    <div className={`text-xs text-white inline-flex font-medium rounded-full text-center px-3 py-1`} style={{background: color}}>{title}</div>
  )
}
