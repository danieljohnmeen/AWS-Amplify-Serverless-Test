// This file is used to override the REST API resources configuration
import { AmplifyApiRestResourceStackTemplate, AmplifyProjectInfo } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyApiRestResourceStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    resources.restApi.description = "Custom description";
    resources.restApi.minimumCompressionSize = 1024;
    // Replace the following with your Auth resource name
  
}
