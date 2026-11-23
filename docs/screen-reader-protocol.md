# Screen-reader conformance

Run this protocol when a component milestone adds or changes a public interaction. Use the built example from the candidate package. Record a result for each supported pairing and each applicable pattern row. UL-09 supplies the protocol and automated samples. Manual results belong to the component and release being tested.

## Test setup

| Pairing | How to exercise the example |
| --- | --- |
| NVDA with Firefox on Windows | Read to the example in browse mode. Tab into it, switch to focus mode when needed and perform the pattern's keyboard sequence. Return to browse mode and read past the control. |
| VoiceOver with Safari on macOS | Read to the example with the VoiceOver cursor, interact with its group and activate its controls. Exercise keyboard navigation with Quick Nav off. Check both the VoiceOver cursor and keyboard focus after dismissal. |
| TalkBack with Chrome on Android | Swipe forward and backward through the example, explore by touch and double-tap to activate. Open and dismiss the soft keyboard for editable fields. Verify the next swipe after selection or dismissal. |
| VoiceOver with Safari on iPadOS | Repeat the touch sequence on tablet, rotate with the pattern open and use an external keyboard when the component supports one. Record the input method. |

Start with the default example. Repeat the relevant steps with disabled, invalid, selected, pending and empty states when available. For each step, record the meaningful name, role, state, value or announcement you heard and the element reached next. Wording can vary by screen reader and verbosity setting.

## Pattern checks

| Pattern | Action and expected observation |
| --- | --- |
| Button, IconButton, link and pagination | Find by name and role. Activate and verify the action or destination. Check current page, disabled and pending state when present. An in-place action keeps a meaningful focus position. |
| Field, TextField and Textarea | Enter through the label. Hear name, required state, description and any error. Edit using a real IME, accept a candidate and submit. Verify the value and error announcements occur at the documented times. |
| Checkbox, switch, toggle and toggle group | Read the starting state, activate twice and verify each state change. For a group, hear its label and the state of the focused member. |
| Radio group | Enter on the selected option, move among options with arrows and exit the group with Tab. Verify label, group, checked state and position. |
| Select, listbox and editable combobox | Open, navigate options, select, reopen and cancel. Verify expanded state, current option, selection, value and focus after close. In an editable example, compose a word before choosing an option. |
| Tooltip and popover | Reach the trigger and open the content using the supported input. Hear the description or reach the content, dismiss it and continue from the documented focus position. |
| Dialog and AlertDialog | Open, hear the title and description, find initial focus, traverse forward and backward and attempt to reach background controls. Close and verify focus returns. For a destructive action, verify initial focus and the cancel path. |
| Dropdown menu | Open, traverse items, activate a choice, then repeat and dismiss. Check item roles, disabled/checked state, submenu navigation and focus restoration. |
| Tabs | Enter the tab list, change tabs with the documented activation model and read the associated panel. Verify selected state and that hidden panels are skipped. |
| Slider | Read the name, value and units. Increase and decrease the value, test its limits and use the screen reader's adjustable-control gesture on touch devices. |
| FileDropzone | Reach the file picker with keyboard or touch, select and remove a file, then try a rejected file. Verify names, status/error feedback and focus after removal. |
| Table | Navigate by rows and columns. Check the caption, header associations and names of interactive cells. |
| Alert, Toast, Progress and Spinner | Trigger a change while reading elsewhere. Record announcement order, urgency, repetition and whether focus moved. Verify value or pending state and accessible dismissal where relevant. |
| Card, badges, removable chips, Separator, Skeleton, EmptyState and icons | Read in document order. Verify meaningful structure and text, decorative content is skipped, and each interactive part can be found by a specific accessible name. |

## Recording results

Record the commit or package version, example URL, OS and browser versions, screen-reader version and verbosity, input method, locale and text direction. For each row record steps, expected result, observed speech and focus, and **pass**, **fail** or **untested**. Include the issue and retest result for each failure. A missing device stays untested. Attach the record to the component PR or release conformance report.

## Extending the automated gate

Translate the component's APG keyboard contract into named rows for `runKeyboardTable` in `test/browser/harness.mjs`. Each row supplies starting focus and state, a sequence of Playwright key names and assertions for the resulting focus and public behavior. The runner reloads the example between rows and reports the failing row and key sequence. The shipped sample exercises both activation keys on a native button that updates the packaged component. [WAI-ARIA APG Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

The browser suite runs axe on the SPA, hydrated SSR and input examples, and uses touch pointer events and synthetic IME composition in three engines. Use a device and its real IME to verify candidate selection and spoken feedback. DOM assertions and axe results cover only the automated portion of the protocol. [axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)

Guidepup can drive NVDA and VoiceOver and capture speech for regression assertions. An initial pilot should replay the dialog open, title and focus-return sequence on Windows and macOS once that component exists. Our current Linux browser jobs do not run those assistive technologies, and Guidepup does not cover Android TalkBack. Keep human listening checks for release decisions. [Guidepup](https://www.guidepup.dev/)
