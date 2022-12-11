import { useState } from "react";
import { Action, ActionPanel, List, getPreferenceValues } from "@raycast/api";

interface Preferences {
  useUppercase: boolean;
}

const basis = [10, 2, 8, 16];

export default function Command() {
  const [input, setInput] = useState<string | undefined>(undefined);

  const num = inputToNumber(input);

  return (
    <List searchBarPlaceholder='Input number... (e.g. "29" "0x3F "16 A2")' onSearchTextChange={setInput}>
      {!input || input.trim() === "" ? (
        <List.EmptyView title="No result" />
      ) : num === undefined ? (
        <List.EmptyView title="Invalid value" description='e.g. "29" "0x3F "16 A2"' />
      ) : (
        <>
          {basis.map((base) => (
            <ConvertedNumber key={base} num={num} base={base}></ConvertedNumber>
          ))}
          <List.Item
            title="Other bases..."
            actions={
              <ActionPanel>
                <Action.Push title="Other bases..." target={<ConvertToAnyBase num={num} />} />
              </ActionPanel>
            }
          />
        </>
      )}
    </List>
  );
}

const ConvertToAnyBase = (props: { num: bigint }) => {
  const [input, setInput] = useState<string | undefined>(undefined);

  return (
    <List searchBarPlaceholder="Search..." onSearchTextChange={setInput}>
      {range(2, 37)
        .filter((base) => !input || base.toString().includes(input))
        .map((base) => (
          <ConvertedNumber key={base} num={props.num} base={base}></ConvertedNumber>
        ))}
    </List>
  );
};

const ConvertedNumber = ({ num, base }: { num: bigint; base: number }) => {
  if (base < 2 || 36 < base) {
    return <></>;
  }

  return (
    <List.Item
      title={numberToString(num, base)}
      subtitle={`(${base})`}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={numberToString(num, base)} />
        </ActionPanel>
      }
    />
  );
};

/**
 * 数値を与えられた基数表記の文字列に変換する。
 */
const numberToString = (num: bigint, base: number): string => {
  const preferences = getPreferenceValues<Preferences>();
  return preferences.useUppercase ? num.toString(base).toUpperCase() : num.toString(base);
};

/**
 * 入力された文字列を数値に変換する
 *
 * 入力値は "29" "0x3F "16 A2" など。
 * 空白で区切った場合は "{基数} {数値}" として扱う。"16 A2" の場合は "162"。
 */
const inputToNumber = (input: string | undefined): bigint | undefined => {
  if (!input) {
    return undefined;
  }

  const splitted = input.trim().split(" ");

  try {
    if (splitted.length > 1) {
      const [base, num] = splitted;
      const base_ = Number(base);

      // FIXME: parseIntを挟むので大きい数字は扱えない。StringからBigIntへの変換方法を変える必要がある。
      return BigInt(parseInt(num, base_));
    } else {
      const [num] = splitted;
      return BigInt(num);
    }
  } catch {
    return undefined;
  }
};

/** Range */
const range = (start: number, end: number) => [...Array(end).keys()].slice(start);
