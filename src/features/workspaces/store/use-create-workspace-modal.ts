import { atom, useAtom } from "jotai";

const modalState = atom(false);

export const useCreateWorkSapceModal = () => {
  return useAtom(modalState);
};
