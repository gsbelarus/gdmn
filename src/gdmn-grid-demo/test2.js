const func = () => {
  const a = 5
  const b = 10
  return (a, b) => a + b
}

console.log(func()(5, 10))