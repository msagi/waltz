package com.khartec.waltz.model.survey;

import java.util.Objects;

public class SurveyInstanceStateTransition {
    private final SurveyInstanceAction action;
    private final SurveyInstanceStatus futureStatus;

    SurveyInstanceStateTransition(SurveyInstanceAction action, SurveyInstanceStatus futureStatus) {
        Objects.requireNonNull(action, "Action cannot be null");
        Objects.requireNonNull(futureStatus, "Future Status cannot be null");
        this.action = action;
        this.futureStatus = futureStatus;
    }

    public SurveyInstanceAction getAction() {
        return action;
    }

    public SurveyInstanceStatus getFutureStatus() {
        return futureStatus;
    }

    public static SurveyInstanceStateTransition transition(SurveyInstanceAction action, SurveyInstanceStatus futureStatus) {
        return new SurveyInstanceStateTransition(action, futureStatus);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SurveyInstanceStateTransition that = (SurveyInstanceStateTransition) o;
        return action == that.action &&
                futureStatus == that.futureStatus;
    }

    @Override
    public int hashCode() {
        return Objects.hash(action, futureStatus);
    }
}
