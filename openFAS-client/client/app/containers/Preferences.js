import React from 'react';
import { PageHeader, Card } from 'antd';
import route from '../constants/routes';

const routes = [
  {
    path: route.PREFERENCES,
    breadcrumbName: 'Preferences'
  },
  {
    path: route.PREFERENCES,
    breadcrumbName: 'All Preferences'
  }
];

class Preferences extends React.Component {
  render() {
    return (
      <div>
        <PageHeader
          style={{ background: 'white' }}
          title="My Account"
          subTitle="User details and preferences."
          breadcrumb={{ routes }}
        />
        <Card style={styles.container}>
          <p>This feature is currently unavailable.</p>
        </Card>
      </div>
    );
  }
}

export default Preferences;

const styles = {
  container: {
    margin: 20
  }
};
