import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { noctisLilac } from "@uiw/codemirror-theme-noctis-lilac";
import { simpleMode } from "@codemirror/legacy-modes/mode/simple-mode";
import { StreamLanguage } from "@codemirror/language";
import { useState } from "react";
import { useTheme } from "@mui/material";
import { EditorView } from "@codemirror/view";
import { lineNumbers } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { syntaxHighlighting } from "@codemirror/language";

const aleoSyntaxHighlight = {
    start: [
        {
            regex: /(?:^|\s)(function|program|as|by|interface|closure|into|import)(?:$|\s)/,
            token: "keyword",
        },
        {
            regex: /(?:^|\s)(finalize|mapping)(?:$|\s)/,
            token: "atom",
        },
        {
            regex: /(?:^|\s)(abs.w|abs|add.w|add|and|assert|assert.eq|assert.neq|block.height|branch.eq|branch.neq|call|cast|cast.loosy|commit.bhp256|commit.bhp512|commit.bhp768|commit.bhp1024|commit.ped64|commit.ped128|div.w|div|double|gt|gte|hash.bhp256|hash.bhp512|hash.bhp768|hash.bhp1024|hash.ped64|hash.ped128|hash.psd2|hash.psd4|hash.psd8|inv|input|is.eq|is.neq|lt|lte|key|mod|mul.w|mul|nand|neg|nor|not|or|output|position|pow.w|pow|rand.chacha|rem.w|rem|shl.w|shl|shr.w|srh|sqrt|sub.w|sub|square|ternary|value|xor|get.or_use|get|set|contains|remove)(?:$|\s)/,
            token: "property",
        },
        {
            regex: /(?:field|group|address|scalar|u8|u16|u32|u64|u128|i8|i16|i32|i64|i128)\b/,
            token: "number",
        },
        {
            regex: /\.(constant|public|private|record|aleo)\b/,
            token: "type",
        },
        {
            regex: /(?:^|\s)(record)(?:$|\s)/,
            token: "type",
        },
        {
            regex: /\b([0-9]+)([ui](8|16|32|64|128))?\b/,
            token: "number",
        },
        {
            regex: /[cr][0-9]+/,
            token: "variable",
        },
    ],
};

export function CodeEditor({ value, onChange }) {
    const [isFocused, setIsFocused] = useState(false);
    const theme = useTheme();

    // Clean the value by removing leading/trailing quotes and converting \n to newlines
    const cleanValue = value
        ? (value.startsWith('"') && value.endsWith('"') 
            ? value.slice(1, -1) 
            : value)
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
        : '';

    return (
        <section
            style={{
                overflow: "auto",
                borderRadius: theme.shape.borderRadius,
                height: "300px",
                outline: isFocused
                    ? `1px solid ${theme.palette.primary.main}`
                    : "none",
                boxShadow: isFocused
                    ? `0 0 0 2px ${theme.palette.primary.main}`
                    : "none",
            }}
        >
            <CodeMirror
                style={{
                    overflow: "auto",
                    borderRadius: theme.shape.borderRadius,
                }}
                value={cleanValue}
                extensions={[
                    lineNumbers(),
                    EditorView.lineWrapping,
                    EditorView.theme({
                        "&": {
                            fontSize: "14px",
                            fontFamily: "monospace",
                        },
                        ".cm-line": {
                            padding: "0 4px",
                        },
                    }),
                    StreamLanguage.define(simpleMode(aleoSyntaxHighlight)),
                ]}
                theme={theme.palette.mode === "dark" ? okaidia : noctisLilac}
                onChange={onChange}
                height="300px"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </section>
    );
}