import React, { Component } from 'react';
import { connect } from 'react-redux';
import Radium, { StyleRoot } from 'radium'
import {
  Link
} from 'react-router'
import PropTypes from 'prop-types'
import TenantApp from './tenant/TenantApp'
import Chat from './chat/Chat'


class AppRoot extends Component {

  loadHeader() {
    return (
      <ul style={headerStyles().list}>
        <li><Link to='/'>Search</Link></li>
      </ul>
		)
  }

	render() {
		return (
      <div style={comStyles().main}>
        <StyleRoot>
          {this.loadHeader()}
          <TenantApp style={comStyles().app}>
            {this.props.children}
          </TenantApp>
          <Chat style={comStyles().chat} />
        </StyleRoot>
      </div>
		)
	}
}

AppRoot.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object
}

AppRoot.defaultProps = {
  children: {},
  location: {}
}

const RadiumHOC = Radium(AppRoot)

function mapStateToProps(state) {
	return {

	}
}

export default connect(mapStateToProps, {})(RadiumHOC)

// =============================

const comStyles = () => {
	return {
    main: {
			width: '100vw',
			height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
		app: {
			width: '100%',
      justifySelf: 'stretch',
		},
    chat: {
			position: 'absolute',
			bottom: '5px',
			right: '5px',
    }
	}
}

const headerStyles = () => {
  return {
    list: {
      width: '100%',
			height: '50px',
    }
  }
}
