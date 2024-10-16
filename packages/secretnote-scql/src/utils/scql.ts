/**
 * Get project id from url.
 */
export const getProjectId = () => {
  const list = location.pathname.split('/');
  return list[list.length - 1];
};
