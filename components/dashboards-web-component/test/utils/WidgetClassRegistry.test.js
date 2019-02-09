/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import WidgetClassRegistry from 'src/utils/WidgetClassRegistry';

describe('WidgetClassRegistry', () => {
    afterEach(() => WidgetClassRegistry.clear());
    const fooWidgetClass = () => {
    };
    const barWidgetClass = () => {
    };

    test('should return the same widget class that was registered previously with the same name', () => {
        WidgetClassRegistry.registerWidgetClass('foo', fooWidgetClass);
        expect(WidgetClassRegistry.getWidgetClass('foo')).toBe(fooWidgetClass);
    });

    test('should return all the registered widget names', () => {
        WidgetClassRegistry.registerWidgetClass('foo', fooWidgetClass);
        WidgetClassRegistry.registerWidgetClass('bar', barWidgetClass);
        expect(WidgetClassRegistry.getRegisteredWidgetNames()).toEqual(['foo', 'bar']);
    });
});