/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific
 *
 */

import {remote} from "./remote";
import {checkIsEntityRef} from "../common/checks";

export function mkLegalEntityRelationshipKindStore() {

    const base = "api/legal-entity-relationship-kind";

    const getById = (id, force = false) => {
        return remote
            .fetchViewDatum("GET", `${base}/${id}`, null, {force});
    };


    const findAll = (force = false) => {
        return remote
            .fetchViewList("GET", `${base}`, null, {force});
    };

    return {
        getById,
        findAll
    };
}

export const legalEntityRelationshipKindStore = mkLegalEntityRelationshipKindStore();
