(() => {
  const parsedUrl = new URL(window.location.href);
  if (parsedUrl.searchParams.get('token')) {
    parsedUrl.searchParams.delete('token');
    window.history.replaceState({}, '', parsedUrl.href);
  }
})();
