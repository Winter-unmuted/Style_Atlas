# Style Atlas (ComfyUI)
<img width="3102" height="4944" alt="ComfyUI_0041" src="https://github.com/user-attachments/assets/1d7f1982-3a3e-4c74-9b78-cbf7b5df1b85" />

A ComfyUI node that builds prompts from a spreadsheet of about 1,500 art styles and 200 modifiers. Write your subject, pick a style (or Random), add modifiers if you want, and it outputs one combined prompt.

This started as a fork to be merged with the node pack made by Github/reddit user atlasimp with only some minor improvements, but they went a different direction and I liked the functionality this had, so I'm keeping it as is. 

## Install (Windows)

1. Install Git from https://git-scm.com/download/win (default options).
2. Open a Command Prompt in your `custom_nodes` folder. Either:
   - run `cd /d C:\path\to\ComfyUI\custom_nodes`, or
   - open the folder in File Explorer, type `cmd` in the address bar, and press Enter.
3. Download the node:
   ```
   git clone https://github.com/Winter-unmuted/Style_Atlas.git
   ```
4. Install openpyxl. For portable ComfyUI:
   ```
   cd Style_Atlas
   ..\..\..\python_embeded\python.exe -m pip install openpyxl
   ```
   For other setups, activate ComfyUI's Python environment and run `pip install openpyxl`.
5. Restart ComfyUI fully and press Ctrl + F5 in the browser. Right-click > Add Node > Style Atlas > Prompt > Style Atlas.

The library must be in the node folder, named `style_atlas_library.xlsx`.

To update later, run `git pull` inside the `Style_Atlas` folder. Back up the xlsx first if you've edited it.

## Inputs
<img width="756" height="1288" alt="image" src="https://github.com/user-attachments/assets/b473592e-958b-4bff-a79e-74e8e0c7f03e" />

| Input | Purpose |
|---|---|
| prompt | Your subject |
| seed | Controls Random picks. Same seed, same result. |
| version | Use each style's Short or Long description |
| subject, realism, era, category, subcategory | Filters. The dropdowns are linked and show match counts. |
| realism_mode | Exact match, or within 1 |
| style | A specific style, or Random from the filtered list |
| style_position | How prompt and style are arranged |
| include_style_names | Keep or drop the "Style Name:" prefix |
| mod_* | Optional modifiers (lighting, palette, etc.): None, Random, or a specific one |
| custom_template | Your own layout, used when style_position is "custom template" |

The dropdowns link in order: Subject > Era > Category > Subcategory > Style. Version and realism also filter the lists. Realism runs from 1 (stylized) to 5 (photoreal) and only filters base styles. The Architectural, Vehicle, and Product modifiers only apply when the matching subject (or All) is selected.

## Custom template placeholders

| Placeholder | Inserts |
|---|---|
| `{prompt}` | Your prompt |
| `{style}` | Style text, plus modifiers unless `{modifiers}` is used |
| `{modifiers}` | Modifier text |
| `{style_name}` | Style name |
| `{style_short_only}` | Short Version only |
| `{style_long_only}` | Long Version only |
| `\n` or `/n` | Line break |

Example: `{prompt}\n{style_name}\n{modifiers}`

## Outputs

- **prompt**: the finished prompt
- **style_text**: style and modifiers only
- **info**: what was picked and how many styles matched

## Editing the library

Edit `style_atlas_library.xlsx` in Excel. Columns used: Style Name, Category, Subcategory, Era, Realism (1-5), Short Version, Long Version, Subject, Layer (Base Style or Modifier).

Text changes apply on the next run. If the seed is fixed and nothing else changed, ComfyUI may reuse the old result, so tweak any input. New styles appear in the dropdowns after a restart.

## Troubleshooting

- Node missing: Python problem. Check the ComfyUI console for "IMPORT FAILED".
- "openpyxl is not installed": redo step 4 with ComfyUI's Python.
- Dropdowns not linked: JS problem. Check F12 > Console. The node works either way.
