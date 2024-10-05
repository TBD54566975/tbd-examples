// @vitest-environment jsdom
import { beforeEach, describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'

let dom
let document

describe('index page', () => {
  beforeEach(async () => {
    dom = await JSDOM.fromFile('index.html', {
      runScripts: 'dangerously', 
      resources: 'usable'
    })
    await new Promise((resolve) => dom.window.addEventListener("load", resolve));
    document = dom.window.document
  })


  it('should render "Hello, world!"', () => {
      expect(document.querySelector('#app')).not.toBe(null)
      expect(document.querySelector('#app').innerHTML).toContain('Hello, world!')  
  })
})
