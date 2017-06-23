import React, { Component } from 'react'
import { connect } from 'react-redux'
import Radium from 'radium'
import PropTypes from 'prop-types'
import { Feed } from 'semantic-ui-react'
import BuildingListCard from './BuildingListCard'

class BuildingList extends Component {

  generateMockBuildings() {
    return [
      { building_id: 25245921949 },
      { building_id: 80432574889 },
    ]
  }

	render() {
		return (
      <Feed>
        {
          generateMockBuildings().map((building) => {
            return (
              <Feed.Event key={building.building_id}>
                <Feed.Label image='/assets/images/avatar/small/jenny.jpg' />
                <Feed.Content>
                  <Feed.Date content='1 day ago' />
                  <Feed.Summary>
                    You added <a>Jenny Hess</a> to your <a>coworker</a> group.
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            )
          })
        }
      </Feed>
		)
	}
}

BuildingList.propTypes = {

}

BuildingList.defaultProps = {

}

const RadiumHOC = Radium(BuildingList)

function mapStateToProps(state) {
	return {

	}
}

export default connect(mapStateToProps, {})(RadiumHOC)

// ===============================

const comStyles = () => {
	return {
		mainview: {

		}
	}
}
