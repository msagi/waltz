<script>

    import ReportGridPicker from "./ReportGridPicker.svelte";
    import NoData from "../../../common/svelte/NoData.svelte";
    import {ownedReportIds, selectedGrid} from "./report-grid-store";
    import {reportGridKinds} from "./report-grid-utils";
    import ReportGridEditor from "./ReportGridEditor.svelte";
    import ReportGridCloneConfirmation from "./ReportGridCloneConfirmation.svelte";
    import {reportGridMemberStore} from "../../../svelte-stores/report-grid-member-store";
    import {reportGridStore} from "../../../svelte-stores/report-grid-store";
    import toasts from "../../../svelte-stores/toast-store";
    import Icon from "../../../common/svelte/Icon.svelte";
    import _ from "lodash";
    import {entity} from "../../../common/services/enums/entity";
    import pageInfo from "../../../svelte-stores/page-navigation-store";

    export let onGridSelect = () => console.log("selecting grid");
    export let primaryEntityRef;

    const Modes = {
        VIEW: "VIEW",
        EDIT: "EDIT",
        REMOVE: "REMOVE",
        CLONE: "CLONE"
    };

    let activeMode = Modes.VIEW;
    let grids = [];
    let owners = [];
    let viewers = [];

    $: reportGridCall = reportGridStore.findForUser(true);
    $: grids = $reportGridCall.data;

    $: gridMembersCall = $selectedGrid?.definition?.id && reportGridMemberStore.findByGridId($selectedGrid?.definition?.id);

    $: gridMembers = $gridMembersCall?.data || [];
    $: [owners, viewers] = _.partition(gridMembers, d => d.role === 'OWNER');

    function selectGrid(grid, isNew = false) {
        $selectedGrid = null;
        activeMode = Modes.VIEW;
        onGridSelect(grid, isNew);
    }

    function create(grid) {
        const createCmd = {
            name: grid.name,
            description: grid.description,
            kind: grid.kind,
            subjectKind: grid.subjectKind
        };

        let savePromise = reportGridStore.create(createCmd);
        Promise.resolve(savePromise)
            .then(r => {
                toasts.success("Grid created successfully");
                selectGrid(r.data, true);
                reportGridCall = reportGridStore.findForUser(true);
            })
            .catch(e => toasts.error("Could not create report grid. " + e.error));
    }

    function update(grid){
        const updateCmd = {
            name: grid.name,
            description: grid.description,
            kind: grid.kind
        }

        let savePromise = reportGridStore.update(grid.id, updateCmd);
        Promise.resolve(savePromise)
            .then(r => {
                toasts.success("Grid updated successfully")
                selectGrid(r.data);
                reportGridCall = reportGridStore.findForUser(true);
            })
            .catch(e => toasts.error("Could not update grid. " + e.error));
    }

    function clone(gridId, cloneCmd) {
        let savePromise = reportGridStore.clone(gridId, cloneCmd);
        Promise.resolve(savePromise)
            .then(r => {
                toasts.success("Grid cloned successfully")
                const grid = r.data;
                selectGrid(grid);
                reportGridCall = reportGridStore.findForUser(true);
            })
            .catch(e => toasts.error("Could not clone grid. " + e.error));
    }

    function remove(grid) {

        let rmPromise = reportGridStore.remove(grid.id);
        Promise.resolve(rmPromise)
            .then(r => {
                toasts.success("Grid removed successfully")
                selectGrid(null);
                reportGridCall = reportGridStore.findForUser(true);
            })
            .catch(e => toasts.error("Could not remove grid"));
    }

    function saveReportGrid(grid) {
        if(grid.id){
            update(grid);
        } else {
            create(grid);
        }
    }

    function createGrid() {

        const workingGrid = {
            name: null,
            description: null,
            externalId: null,
            kind: reportGridKinds.PRIVATE.key,
        }

        $selectedGrid = { definition: workingGrid };
        activeMode = Modes.EDIT
    }


    function cancel() {
        activeMode = Modes.VIEW;
        $selectedGrid = $selectedGrid.definition.id ? $selectedGrid : null;
    }

    function visitPageView() {
        $pageInfo = {
            state: "main.report-grid.view",
            params: {
                gridId: $selectedGrid.definition.id,
                kind: primaryEntityRef.kind,
                id: primaryEntityRef.id
            }
        };
    }

</script>

<div class="row">
    <div class="col-sm-5">
        <ReportGridPicker grids={grids}
                          onCreate={createGrid}
                          onGridSelect={selectGrid}/>
    </div>
    <div class="col-sm-7">

        {#if activeMode === Modes.EDIT}
            <h4>Editing report grid:</h4>
            <ReportGridEditor grid={$selectedGrid?.definition}
                              doSave={saveReportGrid}
                              doCancel={cancel}/>
        {:else if activeMode === Modes.CLONE}
            <ReportGridCloneConfirmation grid={$selectedGrid}
                                         doClone={clone}
                                         doCancel={cancel}/>
        {:else if activeMode === Modes.VIEW || activeMode === Modes.REMOVE}
            {#if $selectedGrid?.definition?.id}
                <h4 title="Click to open in dedicated view">
                    <button on:click={() => visitPageView()}
                            class="btn btn-link">
                        {$selectedGrid?.definition?.name}
                        <Icon name="external-link"/>
                    </button>
                </h4>
                <table class="table table-condensed small">
                    <tbody>
                    <tr>
                        <td>External ID</td>
                        <td>{$selectedGrid?.definition?.externalId || "-"}</td>
                    </tr>
                    <tr>
                        <td>Subject Kind</td>
                        <td>
                            <Icon name={_.get(entity[$selectedGrid?.definition?.subjectKind], 'icon')}/>
                            {_.get(entity[$selectedGrid?.definition?.subjectKind], 'name', 'Unknown Kind')}
                        </td>
                    </tr>
                    <tr>
                        <td>Kind</td>
                        <td>
                            <Icon name={$selectedGrid?.definition?.kind === 'PUBLIC' ? "users" : "user-secret"}/>
                            {_.get(reportGridKinds[$selectedGrid?.definition?.kind], 'name', 'Unknown Kind')}</td>
                    </tr>
                    <tr id="report-grid-identifier-externalId" style="display:none;">
                        <td>externalId</td>
                        <td>{$selectedGrid?.definition?.externalId}</td>
                    </tr>
                    <tr>
                        <td>Owners</td>
                        <td>
                            {#if !_.isEmpty(owners)}
                                <div class:waltz-scroll-region-150={_.size(owners) > 10}>
                                    <ul>
                                        {#each _.orderBy(owners, d => d.userId) as owner}
                                            <li>
                                                {owner.userId}
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {:else}
                                <span class="text-muted">None defined</span>
                            {/if}
                        </td>
                    </tr>
                    <tr>
                        <td>Viewers</td>
                        <td>
                            {#if !_.isEmpty(viewers)}
                                <div class:waltz-scroll-region-150={_.size(viewers) > 10}>
                                    <ul>
                                        {#each _.orderBy(viewers, d => d.userId) as viewer}
                                            <li>
                                                {viewer.userId}
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            {:else}
                                <span class="text-muted">None defined</span>
                            {/if}
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div class:text-muted={!$selectedGrid?.definition?.description}
                     style="padding-bottom: 2em;">
                    {$selectedGrid?.definition?.description || "No description provided"}
                </div>
                {#if _.includes($ownedReportIds, $selectedGrid.definition?.id)}
                    {#if activeMode === Modes.REMOVE}
                        <h4>Please confirm you would like to delete this grid?</h4>
                        <ul>
                            <li>It cannot be restored</li>
                            <li>It will be deleted for all users</li>
                            <li>It will be deleted across all views in Waltz (Org Units, App Groups, People etc.)</li>
                        </ul>
                        <button class="btn-danger btn btn-sm"
                                on:click={() => remove($selectedGrid.definition)}>
                            Yes, delete this grid
                        </button>
                        <button class="btn-primary btn btn-sm"
                                on:click={() => activeMode = Modes.VIEW}>
                            Cancel
                        </button>
                    {/if}
                    {#if activeMode === Modes.VIEW}
                        <button class="btn btn-sm btn-primary"
                                on:click={() => activeMode = Modes.EDIT}>
                            <Icon name="pencil"/>
                            Edit Grid Overview
                        </button>
                        <button class="btn btn-sm btn-primary"
                                on:click={() => activeMode = Modes.CLONE}>
                            <Icon name="clone"/>
                            Clone Grid
                        </button>
                        <button class="btn btn-sm btn-danger"
                                on:click={() => activeMode = Modes.REMOVE}>
                            <Icon name="trash"/>
                            Delete Grid
                        </button>
                        <div class="help-block small">
                            <Icon name="info-circle"/>
                            To edit the columns for the grid use the 'Column Editor' tab above.
                        </div>
                    {/if}
                {:else}
                    <div class="help-block small">
                        <Icon name="info-circle"/>
                        You cannot edit this grid as you are not an owner.
                    </div>
                    <button class="btn btn-sm btn-primary"
                            on:click={() => activeMode = Modes.CLONE}>
                        <Icon name="clone"/>
                        Clone Grid
                    </button>
                {/if}
            {:else}
                <NoData>Waiting for grid selection</NoData>
            {/if}
        {/if}
    </div>
</div>

<style>
     ul {
         padding-left: 1em
     }
</style>