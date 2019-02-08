/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardHeader from '@material-ui/core/CardHeader';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Snackbar from '@material-ui/core/Snackbar';
import NavigationMoreVert from '@material-ui/icons/MoreVert';
import { withStyles } from '@material-ui/core/styles';

import DashboardThumbnail from '../../utils/DashboardThumbnail';
import DashboardAPI from '../../utils/apis/DashboardAPI';
import DashboardExporter from '../../utils/DashboardExporter';

const styles = {
    card: {
        display: 'inline-block',
        width: 'calc(25% - 20px)',
        minWidth: 300,
        margin: '20px 10px 0px 10px',
    },
    cardTitleText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '1.125em',
    },
    cardSubtitleText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '0.8em',
    },
    cardActions: {
        float: 'right',
        paddingRight: 0,
    },
    menuIcon: {
        float: 'right',
        padding: '4px',
        cursor: 'pointer',
    },
    cardTitle: {
        float: 'left',
    },
};

class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuAnchorElement: null,
            isDashboardDeleteConfirmDialogOpen: false,
            dashboardDeleteActionResult: null,
        };

        this.handleMenuIconClick = this.handleMenuIconClick.bind(this);
        this.handleMenuCloseRequest = this.handleMenuCloseRequest.bind(this);
        this.hideDashboardDeleteConfirmDialog = this.hideDashboardDeleteConfirmDialog.bind(this);
        this.showDashboardDeleteConfirmDialog = this.showDashboardDeleteConfirmDialog.bind(this);
        this.handleDashboardDeletionConfirm = this.handleDashboardDeletionConfirm.bind(this);

        this.renderDashboardDeleteConfirmDialog = this.renderDashboardDeleteConfirmDialog.bind(this);
        this.renderDashboardDeletionSuccessMessage = this.renderDashboardDeletionSuccessMessage.bind(this);
        this.renderDashboardDeletionFailMessage = this.renderDashboardDeletionFailMessage.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
    }

    handleMenuIconClick(event) {
        event.preventDefault();
        this.setState({
            isMenuOpen: !this.state.isMenuOpen,
            menuAnchorElement: event.currentTarget,
        });
    }

    handleMenuCloseRequest() {
        this.setState({
            isMenuOpen: false,
        });
    }

    hideDashboardDeleteConfirmDialog() {
        this.setState({ isDashboardDeleteConfirmDialogOpen: false });
    }

    showDashboardDeleteConfirmDialog() {
        this.setState({
            isDashboardDeleteConfirmDialogOpen: true,
            isMenuOpen: false,
        });
    }

    handleDashboardDeletionConfirm(dashboard) {
        this.hideDashboardDeleteConfirmDialog();
        new DashboardAPI().deleteDashboardByID(dashboard.url)
            .then(() => this.setState({ dashboardDeleteActionResult: 'success' }))
            .catch(() => this.setState({ dashboardDeleteActionResult: 'fail' }));
    }

    renderDashboardDeleteConfirmDialog(dashboard) {
        const actionsButtons = [
            <Button
                primary
                label={<FormattedMessage id='dialog-box.confirmation.no' defaultMessage='No' />}
                onClick={this.hideDashboardDeleteConfirmDialog}
            />,
            <Button
                primary
                label={<FormattedMessage id='dialog-box.confirmation.yes' defaultMessage='Yes' />}
                onClick={() => this.handleDashboardDeletionConfirm(dashboard)}
            />,
        ];

        return (
            <Dialog
                title={`Do you want to delete dashboard '${dashboard.name}'?`}
                actions={actionsButtons}
                open={this.state.isDashboardDeleteConfirmDialogOpen}
                modal={false}
                onRequestClose={this.hideDashboardDeleteConfirmDialog}
            >
                This action cannot be undone
            </Dialog>
        );
    }

    renderDashboardDeletionSuccessMessage(dashboard) {
        return (<Snackbar
            open
            message={`Dashboard '${dashboard.name}' deleted successfully`}
            autoHideDuration={4000}
        />);
    }

    renderDashboardDeletionFailMessage(dashboard) {
        return (<Snackbar
            open={this.state.dashboardDeleteActionResult === 'fail'}
            message={`Cannot delete dashboard '${dashboard.name}'`}
            autoHideDuration={4000}
            onRequestClose={() => this.setState({ dashboardDeleteActionResult: null })}
        />);
    }

    renderMenu(dashboard) {
        if (!(dashboard.hasOwnerPermission && dashboard.hasDesignerPermission)) {
            return null;
        }

        let designMenuItem;
        if (dashboard.hasDesignerPermission) {
            designMenuItem = (<MenuItem  component={Link} to={`/designer/${dashboard.url}`}>
               <FormattedMessage id='design.button' defaultMessage='Design' />
            </MenuItem>);
        }
        let exportMenuItem;
        const dashboardName = dashboard.name;
        const dashboardURL = dashboard.url;
        if (dashboard.hasDesignerPermission) {
            exportMenuItem = (<MenuItem onClick={() => DashboardExporter.exportDashboard(dashboardName, dashboardURL)} >
                <FormattedMessage id="export.button" defaultMessage="Export" />
            </MenuItem>);
        }
        let settingsMenuItem;
        let deleteMenuItem;
        if (dashboard.hasOwnerPermission) {
            settingsMenuItem = (<MenuItem  component={Link} to={`/settings/${dashboard.url}`}>
               <FormattedMessage id='settings.button' defaultMessage='Settings' />
              </MenuItem>);
            deleteMenuItem = (<MenuItem onClick={this.showDashboardDeleteConfirmDialog}>
                 <FormattedMessage id='delete.button' defaultMessage='Delete' />
              </MenuItem>);
        }

        return (
            <Popover
                open={!!this.state.menuAnchorElement}
                anchorEl={this.state.menuAnchorElement}
                onClose={() => this.setState({ menuAnchorElement: null })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {designMenuItem}
                {settingsMenuItem}
                {exportMenuItem}
                {deleteMenuItem}
            </Popover>
        );
    }

    render() {
        const dashboard = this.props.dashboard;
        if (this.state.dashboardDeleteActionResult === 'success') {
            return this.renderDashboardDeletionSuccessMessage(dashboard);
        }

        const title = dashboard.name;
        const subtitle = dashboard.description ? dashboard.description.trim() : null;
        const dashboardUrl = dashboard.url;
        const history = this.props.history;

        return (
            <span>
                <Card expanded={false} expandable={false} actAsExpander={false} className={this.props.classes.card}  zDepth={1}>
                    <CardMedia
                        actAsExpander={false}
                        style={{
                            cursor: 'pointer',
                            width: '100%',
                            backgroundImage: `url(${DashboardThumbnail.getDashboardThumbnail(dashboardUrl)})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                        }}
                        onClick={() => history.push(`/dashboards/${dashboardUrl}`)}
                    >
                        <div style={{ height: 120 }}>&nbsp;</div>
                    </CardMedia>
                    <CardHeader
                        actAsExpander={false}
                        showExpandableButton={false}
                        title={
                            <div>
                                <span className={this.props.classes.cardTitle}>{title}</span>
                                {
                                    dashboard.hasOwnerPermission && dashboard.hasDesignerPermission &&
                                    (<NavigationMoreVert onClick={event => this.setState({menuAnchorElement: event.currentTarget })}
                                          className={this.props.classes.menuIcon}/>)
                                }
                            </div>
                        }
                        titleStyle={this.props.classes.cardTitleText}
                        subtitle={subtitle ? <span title={subtitle}>{subtitle}</span> : <span>&nbsp;</span>}
                        subtitleStyle={this.props.classes.cardSubtitleText}
                    />
                </Card>
                {this.renderMenu(dashboard)}
                {this.renderDashboardDeleteConfirmDialog(dashboard)}
                {this.renderDashboardDeletionFailMessage(dashboard)}
            </span>
        );
    }
            }
DashboardCard.propTypes = {
    dashboard: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        hasOwnerPermission: PropTypes.bool.isRequired,
        hasDesignerPermission: PropTypes.bool.isRequired,
    }).isRequired,
    history: PropTypes.shape({}).isRequired,
};

DashboardCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default  withStyles(styles)(withRouter(DashboardCard));
