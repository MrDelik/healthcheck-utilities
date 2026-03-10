import {afterEach, spyOn} from 'bun:test'

afterEach(() => {
  spyOn(global, "fetch").mockRestore();
});