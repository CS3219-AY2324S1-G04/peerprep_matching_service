module.exports = {
  "importOrder": ["<THIRD_PARTY_MODULES>", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true,
  "singleQuote": true,
  "plugins": [require.resolve("@trivago/prettier-plugin-sort-imports")]
}
