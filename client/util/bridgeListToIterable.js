export default list => ({
  list,
  [Symbol.iterator]: () => ({
    index: 0,
    next() {
      if (this.index < list.Count) {
        return { done: false, value: list.getItem(this.index++) };
      }
      return { done: true };
    },
  }),
});
