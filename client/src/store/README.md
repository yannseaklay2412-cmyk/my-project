STORE — global state shared across unrelated pages.
Auth user, theme, cart. Redux/Zustand/Context all live here.
Only put something here if two distant components truly both need it.
Otherwise keep state in the page.
