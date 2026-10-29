# 🎨 Style Atlas (ComfyUI)

## Install
1. Copy the `comfyui-style-atlas` folder into `ComfyUI/custom_nodes/`.
2. Put your library in the folder, named `style_atlas_library.xlsx`
   (rename `styles_wildcard_v23.xlsx`). Other sheets can stay.
3. Portable ComfyUI: `python_embeded\python.exe -m pip install openpyxl`
4. Restart ComfyUI fully, then hard-refresh the browser (Ctrl+F5).
5. Right-click > Add Node > Style Atlas > Prompt > 🎨 Style Atlas.

## Notes
- Dropdowns are linked: Subject > Era > Category > Subcategory > Style, with live counts.
  Version and Realism filter everything.
- Architectural Style / Vehicle Design / Product Design modifiers only appear
  when the matching Subject (or All) is selected.
- Editing the xlsx: prompts update on the next run; restart ComfyUI to refresh the dropdown lists.
- Custom template placeholders: {prompt} {style} {modifiers}
- Troubleshooting: node missing = Python problem (look for IMPORT FAILED in the console).
  Dropdowns not linked = JS problem (F12 > Console). The node works either way.
