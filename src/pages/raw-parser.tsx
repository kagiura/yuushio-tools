import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

const COLUMNS = {
  SPEAKER: 1,
  LINE: 12,
};

const COMMANDS = {
  LOCATION: "890",
  LINE: "800",
  LINE_CHARA: "801",
  LINE_INTERNAL_MONOLOGUE: "802",
};

const parse = (raw: string, protagonist: string) => {
  // if doesnt start with travel_script, return error
  if (!raw.startsWith("travel_script")) {
    return {
      result: null,
      message: "Invalid script (not starting with travel_script)",
    };
  }
  let initMessages = "";
  // extract version as format ver0.0.00
  const version = raw.match(/travel_script ver\d+\.\d+\.\d+/);
  // if version is not 0.4.41 add "not sure if support" message
  if (version && version[0] !== "travel_script ver0.4.41") {
    initMessages += `${version[0]} Version is not supported; Use with caution\n`;
  }

  //   let csv = [];
  let parsed = [];

  // remove first two lines
  let process = raw.split("\n").slice(2);
  // remove empty lines
  process = process.filter((x) => x.trim() !== "");
  // for i
  for (let i = 0; i < process.length; i++) {
    const line = process[i];
    // check if line is a comment
    if (line.startsWith("#")) {
      continue;
    }

    //  remove first and last chara
    const lineWithoutBrackets = line.slice(1, -1);
    const [command, ...argsDelimited] = lineWithoutBrackets.split(":");
    const args = argsDelimited.join(":").split(",");

    let lineContent = args[COLUMNS.LINE].replace(/\[Crlf\]/g, "<br/>");
    const speaker = args[COLUMNS.SPEAKER].replace(/\{Hero\}/g, protagonist);

    const colorPattern = /<color=\[Sharp\]([a-f0-9]{6})>/g;
    const color = lineContent.match(colorPattern);
    if (color) {
      console.log(color);
      lineContent = lineContent.replace(colorPattern, "");
      const hexPattern = /([a-f0-9]{6})/g;
      const [hex] = color[0].match(hexPattern) || ["000000"];
      //wrap the entire line in a span with the color
      lineContent = `<span style="color:#${hex}">${lineContent}</span>`;
      console.log(lineContent);
      console.log("\n\n");
    }

    if (command === COMMANDS.LOCATION) {
      parsed.push(`📍 ${lineContent}`);
      continue;
    }

    if (lineContent) {
      parsed.push(`${speaker ? `<b>${speaker}:</b> ` : ""}${lineContent}`);
    }

    // csv.push([command, args.join("\t")].join("\t"));
  }

  //   csv.push(
  //     "END\tEND\tEND\tEND\tEND\tEND\tEND\tEND\tEND\tEND\tEND\tEND\tEND\tEND\t"
  //   );
  //   console.table({ csv: csv.join("\n") });
  return {
    version: version ? version[0] : "travel_script ver0.4.41",
    initMessages,
    result: parsed.map((l) => `<p>${l}</p>`).join(""),
    message: "",
  };
};

function RawParser() {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [protagonist, setProtagonist] = useState(
    "楓" as "楓" | "椛" | "主任" | "Hero" | "Default"
  );
  return (
    <div className="flex flex-col h-dvh">
      <div className="flex max-h-dvh  p-8 pb-0 gap-8 flex-grow-1 items-stretch min-h-0 flex-1">
        <div className="flex-1 min-h-0">
          <Textarea
            className="h-full"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </div>
        <div className="flex-1 min-h-0">
          <div
            className="mb-1 h-full flex flex-col gap-2.5 overflow-auto min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            // value={parsed?.result || ""}
            dangerouslySetInnerHTML={{ __html: parsed?.result || "" }}
          />
          <div className="text-red-500">{parsed?.initMessages}</div>
        </div>
      </div>
      <div className="flex  p-8 gap-8 flex-grow-0 basis-auto justify-end">
        <RadioGroup
          defaultValue={protagonist}
          className="flex flex-row flex-nowrap"
        >
          {[
            { value: "楓", label: "Kaede" },
            { value: "椛", label: "Momiji" },
            { value: "主任", label: "Shunin" },
            { value: "Hero", label: "Default" },
          ].map((item) => (
            <div className="flex items-center space-x-2" key={item.value}>
              <RadioGroupItem
                value={item.value}
                id={item.value}
                onClick={() => {
                  console.log(item.value);
                  setProtagonist(
                    item.value as "楓" | "椛" | "主任" | "Hero" | "Default"
                  );
                }}
              />
              <Label htmlFor={item.value}>{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
        <Button
          onClick={() => {
            setParsed(parse(raw, protagonist));
          }}
        >
          Parse
        </Button>
      </div>
    </div>
  );
}

export default RawParser;
