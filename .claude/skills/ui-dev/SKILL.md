---
name: ui-dev
description: Build user interfaces
---

When building a UI, follow these guidelines:
1. Use shadcn/ui, tanstack, and headless-ui whenever possible
2. Encode as much UI state in the URL as possible (filters, queries, sorts, etc)
3. Strive to use consistent components / data access codepaths across the UI. For instance, you shouldn't create duplicate components to render the status of a particular entity. Instead, you should just have something like `<FooStatus fooId={fooId} />` or `<FooStatus foo={foo} />`, etc.
4. Scrollbars must be styled to be light/dark mode compatible.
5. Ensure that all data access states are properly handled (loading, error, success, etc). In particular, DO NOT show an empty state if the data is still loading.
6. When showing loading states for large UI blocks, use a loading skeleton component.