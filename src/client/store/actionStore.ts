import { Action } from "@/components/utils/typesPvp";

let actionList: Action[] = [];

export function setActionList(actions: Action[]) {
  actionList = actions;
}

export function getActionList(): Action[] {
  return actionList;
}
