import React, { Component } from 'react';
import { connect } from 'react-redux';
import Radium from 'radium'
import PropTypes from 'prop-types'
import { GrabTenantIdFromCookie } from '../../api/auth/tenant_profile'
import { setupWebsockets, saveTenantProfile, initiatePouchDB } from '../../actions/auth/tenant_auth'


class TenantApp extends Component {

	componentWillMount() {
		GrabTenantIdFromCookie().then((userId) => {
			this.props.saveTenantProfile(userId)
			this.props.setupWebsockets(userId)
			this.props.initiatePouchDB(userId)
		}).catch((err) => {
			console.log(err)
		})
  }

	render() {
		return (
			<div style={comStyles().app}>
				{this.props.children}
				{/* <iframe class="_virtualtour" src="http://www.walk-inside.com/202_188_king_st_waterloo/?format=0&amp;size=1&amp;compass=0&amp;noresize=1" width="100%" height="590"></iframe> */}
			</div>
		)
	}
}

TenantApp.propTypes = {
  children: PropTypes.object,
	saveTenantProfile: PropTypes.func,
	setupWebsockets: PropTypes.func,
	initiatePouchDB: PropTypes.func,
	tenant: PropTypes.object
}

TenantApp.defaultProps = {
  children: {}
}

const RadiumHOC = Radium(TenantApp)

function mapStateToProps(state) {
	return {
		tenant: state.tenant.tenant_profile
	}
}

export default connect(mapStateToProps, {
	setupWebsockets,
	saveTenantProfile,
	initiatePouchDB,
})(RadiumHOC)

// =============================

const comStyles = () => {
	return {
		app: {
			width: '100%',
			height: '100%',
		}
	}
}
