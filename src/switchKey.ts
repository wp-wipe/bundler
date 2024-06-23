export const switchKey = {
  key: Math.random().toString(36).substring(7),
  generate() {
    this.key = Math.random().toString(36).substring(7);
  }
};
