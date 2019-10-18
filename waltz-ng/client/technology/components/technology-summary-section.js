/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import _ from "lodash";
import {initialiseData} from "../../common";
import {mkSelectionOptions} from "../../common/selector-utils";
import {CORE_API} from "../../common/services/core-api-utils";

import template from "./technology-summary-section.html";


const bindings = {
    filters: "<",
    parentEntityRef: "<"
};


const initialState = {
    stats: {},
    hasAnyData: false
};


function controller(serviceBroker) {
    const vm = initialiseData(this, initialState);

    const loadAll = () => {
        const selector = mkSelectionOptions(
            vm.parentEntityRef,
            undefined,
            undefined,
            vm.filters);

        serviceBroker
            .loadViewData(CORE_API.TechnologyStatisticsService.findBySelector, [selector])
            .then(r => {
                vm.stats = r.data;
                const {serverStats = {}, databaseStats = {}, softwareStats = {}} = vm.stats;

                const hasServerStats = (serverStats && !_.isEmpty(serverStats.environmentCounts));
                const hasDbStats = (databaseStats && !_.isEmpty(databaseStats.environmentCounts));
                const hasSwStats = (softwareStats && !_.isEmpty(softwareStats.vendorCounts));

                vm.hasAnyData = hasServerStats || hasDbStats || hasSwStats;
            });
    };


    vm.$onInit = () => {
        loadAll();
    };


    vm.$onChanges = (changes) => {
        if(changes.filters) {
            loadAll();
        }
    };
}


controller.$inject = [
    "ServiceBroker"
];


const component = {
    bindings,
    template,
    controller
};


const id = "waltzTechnologySummarySection";


export default {
    id,
    component
};