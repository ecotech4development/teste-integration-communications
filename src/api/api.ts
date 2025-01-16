/* eslint-disable @typescript-eslint/ban-ts-comment */

import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const api = Axios.create({ baseURL: 'http://127.0.0.1:8000' });

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
    const source = Axios.CancelToken.source();
    const promise = api({ ...config, cancelToken: source.token }).then(
        ({ data }) => data,
    );

    // @ts-expect-error
    promise.cancel = () => {
        source.cancel('Query was cancelled by React Query');
    };

    return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

export default api;