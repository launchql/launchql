import gql from 'graphql-tag';

// Introspection queries
export const IntrospectUploadScalar = gql`
  query IntrospectUploadScalar {
    __type(name: "Upload") {
      name
      kind
      description
    }
  }
`;

export const GetCreateUserInput = gql`
  query GetCreateUserInput {
    __type(name: "UserInput") {
      name
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;

export const GetCreateDocumentInput = gql`
  query GetCreateDocumentInput {
    __type(name: "DocumentInput") {
      name
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;

// Mutation queries - testing the core capability: "上传即存 URL，零手动解析"
export const CreateUserWithAvatar = gql`
  mutation CreateUserWithAvatar($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
        name
        avatarUrl  # Original field - should contain URL after upload
      }
    }
  }
`;

export const UpdateUserAvatar = gql`
  mutation UpdateUserAvatar($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        name
        avatarUrl  # Should be updated with new URL
      }
    }
  }
`;

export const CreateDocumentWithUpload = gql`
  mutation CreateDocumentWithUpload($input: CreateDocumentInput!) {
    createDocument(input: $input) {
      document {
        id
        title
        fileUpload
        fileAttachment
        fileImage
        taggedUpload
      }
    }
  }
`;

export const UpdateDocumentWithUpload = gql`
  mutation UpdateDocumentWithUpload($input: UpdateDocumentInput!) {
    updateDocument(input: $input) {
      document {
        id
        title
        fileUpload
        fileAttachment
        fileImage
        taggedUpload
      }
    }
  }
`;

export const CreateMediaWithUpload = gql`
  mutation CreateMediaWithUpload($input: CreateMediaInput!) {
    createMedia(input: $input) {
      media {
        id
        name
        uploadData
      }
    }
  }
`;

// Additional queries for new test scenarios
export const GetCreateProductInput = gql`
  query GetCreateProductInput {
    __type(name: "ProductInput") {
      name
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;

export const CreateProductWithUpload = gql`
  mutation CreateProductWithUpload($input: CreateProductInput!) {
    createProduct(input: $input) {
      product {
        id
        name
        productImage
        productFile
      }
    }
  }
`;

export const GetCreateProfileInput = gql`
  query GetCreateProfileInput {
    __type(name: "ProfileInput") {
      name
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;

export const CreateProfileWithUpload = gql`
  mutation CreateProfileWithUpload($input: CreateProfileInput!) {
    createProfile(input: $input) {
      profile {
        id
        userId
        avatar
        resume
        portfolio
        customData
      }
    }
  }
`;

export const GetUpdateUserInput = gql`
  query GetUpdateUserInput {
    __type(name: "UpdateUserInput") {
      name
      inputFields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;
