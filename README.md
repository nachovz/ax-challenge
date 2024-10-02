# Project Overview

Hey there, this is a full-stack application that uses React and Typescript as the frontend and consumes a small API. Here's how to get started:

## Installation and Running

```
npm i
npm start
```

# Development

## Commit Messages

We use [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) for consistent and informative commit messages.

## Coding Style

We enforce consistent coding styles using prettier (`.prettierrc` config file).

## Client side caching

This application leverages the `localStorage` to handle a short-term cache to avoid making simultaneous calls to the API. It is guaranteed that one network request is done at a time when navigating to the `/appWithoutSSRData` route.

## Server side caching

This aplication uses the runtime memory to handle a short-term cache consumed by the Server Side execution of the `useCachingFetch` hook. It is guaranteed that the route `/appWithSSRData` will render successfully even without javascript enabled.

## Cache Serialization

This application serializes Server Sided cache data using `json.stringify`, it then uses `json.parse` and stores the initialized data into the `window` object on the client side. It os guaranteed that no network calls are made when navigating to the route `/appWithSSRData` and the same route renders successfully without javascript enabled.

## What's next?

- There's room to improve both Client-side and Server-side caching. In the client side it could be worth it to create a more robust data structure for the cache object or use indexedDB. On the server side, we could implement an instantiable class to centralized the cache functionality.
- Testing: this project could be more robust with some unit testing.
