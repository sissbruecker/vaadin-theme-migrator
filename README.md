# vaadin-theme-migrator

Tool that helps with fixing breaking changes in Vaadin themes when migrating from v23 to v24.

See below for a list of supported migrations.
A lot of necessary changes are done automatically.
If automatic conversion of a change is not implemented, or would result in invalid CSS selectors, the tool will create a TODO in the respective file / on the respective style rule instead.

> **Warning**
> This tool does not support converting themes to the new global styling approach introduced with v24.
> It only attempts to fix breaking changes introduced as part of v24.

## Supported Migrations

| Component              | Breaking Change                                                                |   Support                            |
|------------------------|--------------------------------------------------------------------------------|--------------------------------------|
| accordion              | Move summary button to light DOM                                               | Supported /w Todos                   |
| app-layout             | Remove navbar, drawer pseudo elements                                          | Supported                            |
| avatar-group           | Move avatars in avatar-group into a slot                                       | Supported                            |
| avatar-group           | Update avatar-group to use custom menu and item                                |                                      |
| avatar-group           | Move avatar-group list-box to light DOM                                        | Supported                            |
| context-menu           | Make vaadin-context-menu-item not extend vaadin-item                           |                                      |
| context-menu           | Make vaadin-context-menu-list-box not extend list-box                          |                                      |
| crud                   | Move vaadin-crud's default grid to light dom                                   | Supported                            |
| crud                   | Move new item toolbar button out of Shadow DOM                                 | Supported                            |
| crud                   | Remove id attribute from slotted buttons                                       | Unclear impact, not in upgrade guide |
| date-picker            | Move date-picker overlay content to light DOM                                  | Supported                            |
| date-picker            | Make month calendar infinite-scroller slotted                                  | Supported                            |
| date-picker            | Move toolbar buttons to overlay content light DOM                              | Supported                            |
| date-picker            | Expose different states of calendar date elements as parts                     | Supported                            |
| date-time-picker       | Replace custom date-picker and time-picker extensions with original components | Supported                            |
| details                | Move summary button to light DOM                                               | Supported /w Todos                   |
| grid                   | Move vaadin-grid-filter text field to slot                                     |                                      |
| grid                   | Reflect row and cell states as part names                                      | No breaking changes                  |
| grid                   | Add cellPartNameGenerator to support native ::part()                           | No breaking changes                  |
| login                  | Move forgot-password button out of Shadow DOM                                  | Supported                            |
| login                  | Remove part attribute from elements in global scope                            | Unclear impact, not in upgrade guide |
| menu-bar               | Move menu-bar-buttons into a slot                                              | Supported                            |
| menu-bar               | Use vaadin-menu-bar-item component for sub-menus                               |                                      |
| menu-bar               | Use vaadin-menu-bar-list-box component for sub-menus                           |                                      |
| menu-bar               | Use vaadin-menu-bar-overlay component for sub-menus                            |                                      |
| message-input          | Move vaadin-message-input's text-area and button into slots                    | Supported /w Todos                   |
| message-list           | Move vaadin-message elements into a slot                                       | Supported                            |
| message-list           | Move avatar in vaadin-message to a slot                                        | Supported /w Todos                   |
| multi-select-combo-box | Make multi-select-combo-box-item not extend vaadin-item                        |                                      |
| multi-select-combo-box | Add ::part() selector support to chips in MultiSelectComboBox                  |                                      |
| select                 | Make vaadin-select-item not extend vaadin-item                                 |                                      |
| select                 | Make vaadin-select-list-box not extend vaadin-list-box                         |                                      |
| time-picker            | Make time-picker item not extend combo-box item                                |                                      |
| upload                 | Extract file list to separate component and place it in light DOM              |                                      |
| upload                 | Create slotted elements in light DOM instead of using fallback content         |                                      |
| upload                 | Remove upload file progress bar attributes                                     |                                      |
| upload                 | Move upload file progress bar to light DOM                                     |                                      |
