When I run the project, the following error appears in turbopack:

## Error Type
Console Error

## Error Message
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <SegmentViewNode type="layout" pagePath="layout.tsx">
      <SegmentTrieNode>
      <link>
      <script>
      <RootLayout>
        <ClerkProvider>
          <ClientClerkProvider appearance={{theme:{...}, ...}} publishableKey="pk_test_dG..." proxyUrl="" domain="" ...>
            ...
              <ClerkProvider appearance={{theme:{...}, ...}} publishableKey="pk_test_dG..." proxyUrl="" domain="" ...>
                <ClerkProviderBase appearance={{theme:{...}, ...}} publishableKey="pk_test_dG..." proxyUrl="" domain="" ...>
                  <ClerkContextProvider initialState={undefined} clerk={{clerkjs:null, ...}} clerkStatus="loading">
                    <InitialStateProvider initialState={undefined}>
                      <__experimental_CheckoutProvider value={undefined}>
                        <RouterTelemetry>
                        <ClerkScripts>
                        <html
                          lang="en"
                          className="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__varia..."
-                         data-pip-extension-id="nfbfcldohkaiocjchlemjclmekeknlkc"
                        >



    at html (<anonymous>:null:null)
    at RootLayout (app\layout.tsx:40:7)

## Code Frame
  38 |       }}
  39 |     >
> 40 |       <html
     |       ^
  41 |         lang="en"
  42 |         className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
  43 |       >

Next.js version: 16.3.8 (Turbopack)
