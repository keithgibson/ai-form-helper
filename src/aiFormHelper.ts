import $ from "jquery";
import { createCompletion } from "./openai";
import { systemPrompt } from "./systemPrompt";
(function () {
  "use strict";
  setTimeout(() => {
    $.noConflict();
    $(function () {
      // @ts-expect-error Property 'main' does not exist on type 'Window & typeof globalThis'.
      Window.prototype.main = main;
      console.log("jQuery is ready, starting main");
      main();
    });
  }, 2000);
})();

async function main() {
  const promises: any[] = [];
  function handleInput($input: JQuery<HTMLElement>) {
    if (["text", "email", "tel", "url", ""].includes($input.attr("type") ?? "")) {
      promises.push(createDatalistForTextInput($input));
    }
  }

  $("input").each(function () {
    handleInput($(this));
  });

  $(document).on("focus click", "input", function () {
    handleInput($(this));
  });
  const results = await Promise.allSettled(promises);
  console.dir(results.filter((r) => r.status !== "fulfilled"));
}

/**
 * Creates a new datalist for the input in DOM and sets the input's list attribute to the new datalist's id
 * @param $input target input
 */
async function createDatalistForTextInput($input: JQuery<HTMLElement>) {
  if ($input.attr("list")) return;
  const inputId = $input.attr("id");
  if (!inputId) {
    const newId = "input-" + Math.random().toString(36).substring(2);
    $input.attr("id", newId);
  }
  const id = "datalist-" + $input.attr("id");
  const $datalist = $("<datalist>", {
    id: id,
  });
  $input.attr("list", id);
  $input.after($datalist);
  await populateDatalist($input, $datalist);
}

async function populateDatalist($input: JQuery<HTMLElement>, $datalist: JQuery<HTMLElement>) {
  const inputLabelText = findLabelText($input);
  if (inputLabelText.length === 0) return;
  const aiResponse = await getAIResponse(inputLabelText);
  if (aiResponse.length === 0) {
    console.debug(`No response for ${inputLabelText}`);
    return;
  }
  const $option = $("<option>", {
    value: aiResponse.trim(),
  });
  $datalist.append($option);
}

function findLabelText($input: JQuery<HTMLElement>) {
  const $label = $("label[for='" + $input.attr("id") + "']");
  const labelElementText = $label.text().trim();
  if (typeof labelElementText === "string" && labelElementText.length > 0) {
    return labelElementText;
  }
  // if the top level element is a label
  const $parent = $input.parent();
  if ($parent.is("label")) {
    const parentText = $parent.text().trim();
    if (typeof parentText === "string" && parentText.length > 0) {
      return parentText;
    }
  }

  const placeholderText = $input.attr("placeholder");
  if (typeof placeholderText === "string" && placeholderText.length > 0) {
    return placeholderText;
  }

  const arialabelText = $input.attr("aria-label");
  if (typeof arialabelText === "string" && arialabelText.length > 0) {
    return arialabelText;
  }

  // aria-labelledby designates the id of the element that labels the input
  const ariaLabelledbyText = $input.attr("aria-labelledby");
  if (typeof ariaLabelledbyText === "string" && ariaLabelledbyText.length > 0) {
    const $label = $("#" + ariaLabelledbyText);
    if ($label.length > 0) {
      return $label.text().trim();
    }
  }

  const nameText = $input.attr("name");
  if (typeof nameText === "string" && nameText.length > 0) {
    return nameText;
  }

  const idText = $input.attr("id");
  if (typeof idText === "string" && idText.length > 0) {
    return idText;
  }

  return "";
}

async function getAIResponse(inputLabelText: string) {
  const systemPromptText = systemPrompt();
  const aiResponse = await createCompletion(systemPromptText, inputLabelText);
  return aiResponse;
}
