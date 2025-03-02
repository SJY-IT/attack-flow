import Configuration from "@/assets/builder.config";
import { Module } from "vuex"
import { PageEditor } from "@/store/PageEditor";
import { AppCommand } from "@/store/Commands/AppCommand";
import { PageCommand } from "@/store/Commands/PageCommand";
import { PageRecoveryBank } from "../PageRecoveryBank";
import { DiagramObjectModel } from "@/assets/scripts/BlockDiagram";
import { ValidationErrorResult, ValidationWarningResult } from "@/assets/scripts/DiagramValidator";
import { ModuleStore, ApplicationStore, BaseAppSettings } from "@/store/StoreTypes"

const Publisher = Configuration.publisher ? 
    new Configuration.publisher() : undefined;

export default {
    namespaced: true,
    state: {
        settings: BaseAppSettings,
        clipboard: [],
        publisher: Publisher,
        activePage: PageEditor.createDummy(),
        recoveryBank: new PageRecoveryBank()
    },
    getters: {

        /**
         * Tests if the clipboard has contents.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the clipboard has contents, false otherwise.
         */
        hasClipboardContents(state): boolean {
            return 0 < state.clipboard.length;
        },

        /**
         * Tests if the active page has a selection.
         * @param state
         *  The Vuex state.
         * @returns
         *  The number of items selected.
         */
        hasSelection(state): number {
            let s = [...state.activePage.page.getSubtree(o => o.isSelected())];
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? s : s).length;
        },

        /**
         * Returns the active page's selection.
         * @param state
         *  The Vuex state.
         * @returns
         *  The selected objects.
         */
        getSelection(state): DiagramObjectModel[] {
            let s = [...state.activePage.page.getSubtree(o => o.isSelected())];
            // Use trigger to trip the reactivity system
            return state.activePage.trigger.value ? s : s;
        },

        /**
         * Tests if the last command on the active page can be undone.
         * @returns
         *  True if the last command can be undone, false otherwise.
         */
        canUndo(state): boolean {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).canUndo();
        },

        /**
         * Tests if the last undone command on the active page can be redone.
         * @returns
         *  True if the last undone command can be redone, false otherwise.
         */
        canRedo(state): boolean {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).canRedo();
        },

        /**
         * Tests if the active page represents a valid diagram per the
         * configured validator. If the application is not configured with a
         * validator, true is returned by default.
         * @param state
         *  The Vuex state.
         * @returns
         *  True if the page is valid, false otherwise.
         */
        isValid(state): boolean {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).isValid();
        },

        /**
         * Returns the active page's validation errors. If the application is
         * not configured with a validator, an empty array is returned.
         * @param state
         *  The Vuex state.
         * @returns
         *  The active page's validation errors.
         */
        getValidationErrors(state): ValidationErrorResult[] {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).getValidationErrors(); 
        },

        /**
         * Returns the active page's validation warnings. If the application is
         * not configured with a validator, an empty array is returned.
         * @param state
         *  The Vuex state.
         * @returns
         *  The active page's validation warnings.
         */
        getValidationWarnings(state): ValidationWarningResult[] {
            let p = state.activePage;
            // Use trigger to trip the reactivity system
            return (state.activePage.trigger.value ? p : p).getValidationWarnings();
        }

    },
    mutations: {

        /**
         * Executes an application command.
         * @param state
         *  The Vuex state. 
         * @param command
         *  The application command.
         */
        execute(state, command: AppCommand | PageCommand) {
            if(command instanceof PageCommand) {
                // Ignore null page
                if(command.page === PageCommand.NullPage)
                    return;
                // Execute command
                if(state.activePage.execute(command)) {
                    // If the command was recorded to the page's undo history,
                    // store all progress in the recovery bank.
                    state.recoveryBank.storeEditor(state.activePage);
                };
            } else {
                command.execute();
            }
        }

    }
} as Module<ApplicationStore, ModuleStore>
