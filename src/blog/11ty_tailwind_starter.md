---
date: 2023-02-22
tags: post
title: 11ty Tailwind Starter
layout: blog
series: Personal Website Design
hero: possum.png
---

## tldr;

This short article goes over how I set up this blog and why I chose to use
[Eleventy](https://tailwindcss.com/)
and
[Tailwindcss](https://tailwindcss.com/).

View the starter code at [github]().

## The Tools

### Eleventy
There are a lot of [static site generators](https://jamstack.org/generators/).
[Eleventy](https://tailwindcss.com/) distinguishes itself by:

- having an active user base
- being actively developed
- being a node package

As Eleventy is a node package, I can manage my entire project through
[npm](https://www.npmjs.com/).

### Tailwindcss

[Tailwindcss](https://tailwindcss.com/) makes playing with CSS easy. It provides reasonable
defaults while being flexible enough to make more or less any UI. As someone without much
font end development experience, this is a wonderful tool.

## Setup

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_site/**/*.{html,js}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```
