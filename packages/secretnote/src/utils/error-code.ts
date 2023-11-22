export enum ERROR_CODE {
  NO_ERROR,
  // notebook
  NOTEBOOK_ALREADY_EXISTED,
  // server
  SERVER_NOT_FOUND,
  // integration
  INTEGRATION_ALREADY_EXISTED,
  // node
  NODE_NAME_ALREADY_EXISTED,
  NODE_ADDRESS_ALREADY_EXISTED,
  NODE_OFFLINE,
}

export const ERROR_CODE_MESSAGE: Record<number, string> = {
  [ERROR_CODE.NO_ERROR]: 'No Error',
  [ERROR_CODE.NOTEBOOK_ALREADY_EXISTED]: 'The notebook is already existed.',
  [ERROR_CODE.SERVER_NOT_FOUND]: 'The server is not found.',
  [ERROR_CODE.INTEGRATION_ALREADY_EXISTED]: 'The integration is already existed.',
  [ERROR_CODE.NODE_NAME_ALREADY_EXISTED]: 'The node name is already existed.',
  [ERROR_CODE.NODE_ADDRESS_ALREADY_EXISTED]: 'The node address is already existed.',
  [ERROR_CODE.NODE_OFFLINE]: 'The node is offline.',
};

export const getErrorMessage = (code: number, defaultMessage = 'unknown error') => {
  return ERROR_CODE_MESSAGE[code] || defaultMessage;
};
