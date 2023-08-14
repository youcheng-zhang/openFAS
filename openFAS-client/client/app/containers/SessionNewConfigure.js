import React from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Select, List, Statistic, Skeleton } from 'antd';
import { Layouts } from '../constants/app';
import { withRouter } from 'react-router-dom';
import routes from '../constants/routes';
import PatientNew from './PatientNew';
import * as appActions from '../store/app';
import * as patientActions from '../store/patients';
import * as exerciseActions from '../store/exercises';
import * as sessionActions from '../store/sessions';

class SessionNewConfigure extends React.Component {
  state = {
    selectedExercise: null,
    layout: Layouts.FULL_SCREEN,
    visible: this.props.visible,
    estimatedDuration: Infinity,
    totalImages: Infinity,
    loadedImages: {},
    requiredImages: [],
    patientId: null
  };

  componentDidMount() {
    this.props.indexExercises();
    this.props.indexPatients();
    this.props.resetSession();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.exercises) {
      this.handleChangeExercise(this.defaultExercisesKey(newProps.exercises));
    }
    if (newProps.visible) {
      this.setState({
        visible: newProps.visible
      });
    }
  }

  layoutActions = layout =>
    ({
      [Layouts.DEFAULT]: this.props.toggleLayoutDefault,
      [Layouts.COLLAPSED]: this.props.toggleLayoutCollapsed,
      [Layouts.FULL_SCREEN]: this.props.toggleLayoutFullScreen
    }[layout]);

  defaultExercisesKey = allExercises => {
    const exercises = Object.values(allExercises);
    return exercises.length > 0 ? exercises[0] : null;
  };

  handleChangeExercise = selectedExercise => {
    selectedExercise &&
      this.setState({
        selectedExercise,
        totalImages: selectedExercise.movements.length,
        estimatedDuration: selectedExercise.movements
          .reduce((acc, movement) => acc + movement.duration, 0)
          .toFixed(0),
        requiredImages: selectedExercise.movements.map(
          movement => movement.imageUrl
        )
      });
  };

  handleChangeLayout = layout => {
    this.setState({ layout });
    this.layoutActions(layout)();
  };

  handleChangePatient = patientId => this.setState({ patientId });

  handleLoadedImageSuccess = src =>
    this.setState(state => ({
      loadedImages: { ...state.loadedImages, [src]: true }
    }));

  handleLoadedImageError = src =>
    this.setState(state => ({
      loadedImages: { ...state.loadedImages, [src]: false }
    }));

  loadingImages = () =>
    !this.state.requiredImages.every(url => this.state.loadedImages[url]);

  loadingModal = () =>
    !!this.state.selectedExercise &&
    !this.props.loadingExercises &&
    !this.props.loadingPatients;

  handleSubmit = () => {
    this.setState({ visible: false });
    this.props.createSession({
      exercise: this.state.selectedExercise.id,
      patient: this.state.patientId
    });
    this.layoutActions(this.state.layout)();
    this.props.handleSubmit();
  };

  handleCancel = () => {
    this.props.toggleLayoutDefault();
    return this.props.history.push(routes.SESSIONS);
  };

  render() {
    return (
      <Modal
        centered={true}
        visible={this.state.visible}
        title="Setup New Session"
        onCancel={this.handleCancel}
        footer={[
          <Select
            placeholder="Patient"
            onChange={this.handleChangePatient}
            style={{ minWidth: '30%' }}
          >
            {Object.values(this.props.patients).map(patient => (
              <Select.Option key={patient.id} value={patient.id}>
                {patient.name}
              </Select.Option>
            ))}
          </Select>,
          <PatientNew teams={this.props.teams}>
            <Button icon="plus" />
          </PatientNew>,
          <> </>,
          <Select
            defaultValue={this.state.layout}
            onChange={this.handleChangeLayout}
          >
            <Select.Option value={Layouts.FULL_SCREEN}>
              Full Screen
            </Select.Option>
            <Select.Option value={Layouts.COLLAPSED}>Collapsed</Select.Option>
            <Select.Option value={Layouts.DEFAULT}>Default</Select.Option>
          </Select>,
          <> </>,
          <Button
            key="submit"
            type="primary"
            onClick={this.handleSubmit}
            disabled={
              (!this.loadingImages() && !this.loadingModal()) ||
              this.state.patientId === null
            }
          >
            Instantiate Session
          </Button>
        ]}
      >
        {this.loadingModal() ? (
          <div>
            <div style={styles.toolbar}>
              <Select
                defaultValue={this.state.selectedExercise}
                value={this.state.selectedExercise.name}
                onChange={this.handleChangeExercise}
              >
                {Object.values(this.props.exercises).map(exercise => (
                  <Select.Option key={exercise.id} value={exercise}>
                    {exercise.name}
                  </Select.Option>
                ))}
              </Select>
              <Statistic
                title="Total Exercises"
                value={this.state.totalImages}
              />
              <Statistic
                title="Estimated Duration"
                value={`${this.state.estimatedDuration} seconds`}
              />
            </div>
            <div style={styles.exerciseList}>
              <List
                style={
                  this.loadingImages()
                    ? { display: 'none' }
                    : { display: 'block' }
                }
                itemLayout="horizontal"
                dataSource={this.state.selectedExercise.movements}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <img
                          style={{ width: '100px' }}
                          src={item.imageUrl}
                          onLoad={() =>
                            this.handleLoadedImageSuccess(item.imageUrl)
                          }
                          onError={() =>
                            this.handleLoadedImageError(item.imageUrl)
                          }
                        />
                      }
                      title={<a>{item.name}</a>}
                      description={<span>{item.duration} seconds</span>}
                    />
                  </List.Item>
                )}
              />
              <List
                style={
                  this.loadingImages()
                    ? { display: 'block' }
                    : { display: 'none' }
                }
                itemLayout="horizontal"
                dataSource={this.state.selectedExercise.movements}
                renderItem={() => (
                  <List.Item>
                    <Skeleton active avatar />
                  </List.Item>
                )}
              />
            </div>
          </div>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  app: state.app,
  exercises: state.exercises.entities,
  patients: state.patients.entities,
  loadingPatients: state.patients.status.loading,
  loadingExercises: state.exercises.status.loading
});

const mapDispatchToProps = dispatch => ({
  toggleLayoutDefault: () => dispatch(appActions.toggleLayoutDefault()),
  toggleLayoutCollapsed: () => dispatch(appActions.toggleLayoutCollapsed()),
  toggleLayoutFullScreen: () => dispatch(appActions.toggleLayoutFullScreen()),
  indexPatients: () => dispatch(patientActions.index()),
  indexExercises: () => dispatch(exerciseActions.index()),
  resetSession: () => dispatch(sessionActions.reset()),
  createSession: data => dispatch(sessionActions.create(data))
});

const ConnectedSessionNewConfigure = connect(
  mapStateToProps,
  mapDispatchToProps
)(SessionNewConfigure);

export default withRouter(ConnectedSessionNewConfigure);

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  exerciseList: {
    maxHeight: '50vh',
    overflowY: 'scroll'
  }
};
