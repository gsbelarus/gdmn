const myState = {
  shop: {
    items: [
      {
        value: 5
      },
      {
        value: 10
      },

    ],
    taxPercent: 20
  }
}

const shopItemsSelector = state => state.shop.items
const taxPercentSelector = state => state.shop.taxPercent

const subtotalSelector = state => {
  const items = shopItemsSelector(state)
  return items => items.reduce((acc, item) => acc + item.value, 0)
}

const taxSelector = state => {
  const subtotal = subtotalSelector(state)
  const taxPercent = taxPercentSelector(state)
  return (subtotal, taxPercent) => subtotal * (taxPercent / 100)
}

const totalSelector = state => {
  const subtotal = subtotalSelector(state)
  const tax = taxSelector(state)
  return (subtotal, tax) => ({ total: subtotal + tax })
}

console.log(JSON.stringify(shopItemsSelector(myState), undefined, 2))

console.log(taxPercentSelector(myState))

console.log(subtotalSelector(myState))
console.log(taxSelector(myState))
console.log(totalSelector(myState))