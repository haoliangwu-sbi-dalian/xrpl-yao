// @ts-nocheck

import * as R from "ramda";
import * as xrpl from "xrpl";
import { WellKnownAccount } from "./api";
import BigNumber from "bignumber.js";
import wellKnownAccounts from "./well-known-accounts.json";

export const resolveWellKnownAccountDict = (
  data: WellKnownAccount[]
): Record<string, string> => {
  return R.compose(
    R.fromPairs,
    R.map((e) => [e.account, e.name])
  )(data);
};

export const resolveTxnTotalFunds = (
  data: xrpl.AccountTxResponse["result"]["transactions"]
) =>
  R.compose(
    R.reduce((a, c) => a.plus(c), new BigNumber(0)),
    R.map(
      R.compose(
        R.ifElse(R.is(String), R.identity, R.always(0)),
        R.pathOr(new BigNumber(0), ["tx", "Amount"])
      )
    )
  )(data);

export const resolveTxnTotalFundsDetailView =
  (isDeposit = false) =>
  (data: xrpl.AccountTxResponse["result"]["transactions"]) =>
    R.compose(
      R.mapObjIndexed(resolveTxnTotalFunds),
      R.groupBy(R.path(["tx", isDeposit ? "Account" : "Destination"])),
      R.map(
        R.evolve({
          tx: {
            [isDeposit ? "Account" : "Destination"]: (d) =>
              wellKnownAccounts[d] ?? "Unknown",
          },
        })
      )
    )(data);

// https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
export function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
