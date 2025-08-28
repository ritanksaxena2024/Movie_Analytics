

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { JWTPayload } from "../type.app";
interface UserInformationState {
  userInfo: JWTPayload[];
  addUserInformation: (info: JWTPayload) => void;
}

export const useUserInformationStore = create<UserInformationState>()(
  devtools(
    persist(
      (set) => ({
        userInfo: [],
        addUserInformation: (info: JWTPayload) =>
          set((state) => ({
            userInfo: [info, ...state.userInfo],
          })),
      }),
      { name: "user-info-storage" }
    )
  )
);

