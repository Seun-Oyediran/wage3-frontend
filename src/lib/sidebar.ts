/** Where the desktop sidebar's collapsed state is kept: "1" when collapsed. */
export const SIDEBAR_COLLAPSED_KEY = "wage3.sidebar-collapsed";

/**
 * Runs in <head> before first paint: marks <html data-sidebar="collapsed"> so the sidebar's
 * `collapsed:` styles apply from the start, instead of loading wide and then collapsing.
 */
export const SIDEBAR_PREPAINT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(SIDEBAR_COLLAPSED_KEY)})==="1")document.documentElement.dataset.sidebar="collapsed"}catch(e){}`;
