export default function Flex({children, direction="column", gap=0}) {
  return <div style={{display: "flex", flexDirection: direction, gap: gap}}>
    {children}
  </div>
}