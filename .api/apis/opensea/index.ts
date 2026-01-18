import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'opensea/2.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Get all offers for a specific item.
   *
   * @summary Get Item Offers
   */
  get_offers(metadata: types.GetOffersMetadataParam): Promise<FetchResponse<200, types.GetOffersResponse200>> {
    return this.core.fetch('/api/v2/orders/{chain}/{protocol}/offers', 'get', metadata);
  }

  /**
   * Create an offer to purchase a single NFT (ERC721 or ERC1155).
   *
   * @summary Create Item Offer
   */
  post_offer(body: types.PostOfferBodyParam, metadata: types.PostOfferMetadataParam): Promise<FetchResponse<200, types.PostOfferResponse200>> {
    return this.core.fetch('/api/v2/orders/{chain}/{protocol}/offers', 'post', body, metadata);
  }

  /**
   * Get all listings for a specific item.
   *
   * @summary Get Listings
   */
  get_listings_1(metadata: types.GetListings1MetadataParam): Promise<FetchResponse<200, types.GetListings1Response200>> {
    return this.core.fetch('/api/v2/orders/{chain}/{protocol}/listings', 'get', metadata);
  }

  /**
   * List a single NFT (ERC721 or ERC1155) for sale on the OpenSea marketplace.
   *
   * @summary Create Listing
   */
  post_listing_1(body: types.PostListing1BodyParam, metadata: types.PostListing1MetadataParam): Promise<FetchResponse<200, types.PostListing1Response200>> {
    return this.core.fetch('/api/v2/orders/{chain}/{protocol}/listings', 'post', body, metadata);
  }

  /**
   * Offchain cancel a single order, offer or listing, by its order hash when protected by
   * the SignedZone. Protocol and Chain are required to prevent hash collisions. Please note
   * cancellation is only assured if a fulfillment signature was not vended prior to
   * cancellation.
   *
   * @summary Cancel Order
   */
  cancel_order_1(body: types.CancelOrder1BodyParam, metadata: types.CancelOrder1MetadataParam): Promise<FetchResponse<200, types.CancelOrder1Response200>>;
  cancel_order_1(metadata: types.CancelOrder1MetadataParam): Promise<FetchResponse<200, types.CancelOrder1Response200>>;
  cancel_order_1(body?: types.CancelOrder1BodyParam | types.CancelOrder1MetadataParam, metadata?: types.CancelOrder1MetadataParam): Promise<FetchResponse<200, types.CancelOrder1Response200>> {
    return this.core.fetch('/api/v2/orders/chain/{chain}/protocol/{protocol_address}/{order_hash}/cancel', 'post', body, metadata);
  }

  /**
   * Retrieve all the information, including signatures, needed to fulfill an offer directly
   * onchain.
   *
   * @summary Fulfill Offer
   * @throws FetchError<400, types.GenerateOfferFulfillmentDataV2Response400> The request is invalid
   * The order_hash does not exist
   * The chain is not an EVM Chain
   * The protocol_address is not a supported Seaport contract
   * For other error reasons, see the response data.
   */
  generate_offer_fulfillment_data_v2(body: types.GenerateOfferFulfillmentDataV2BodyParam): Promise<FetchResponse<200, types.GenerateOfferFulfillmentDataV2Response200>> {
    return this.core.fetch('/api/v2/offers/fulfillment_data', 'post', body);
  }

  /**
   * Build a portion of a criteria offer including the merkle tree needed to post an offer.
   *
   * @summary Build Criteria Offer
   */
  build_offer_v2(body: types.BuildOfferV2BodyParam): Promise<FetchResponse<200, types.BuildOfferV2Response200>> {
    return this.core.fetch('/api/v2/offers/build', 'post', body);
  }

  /**
   * Create a criteria offer to purchase any NFT in a collection or which matches the
   * specified trait.
   *
   * @summary Create Criteria Offer
   */
  post_criteria_offer_v2(body: types.PostCriteriaOfferV2BodyParam): Promise<FetchResponse<200, types.PostCriteriaOfferV2Response200>> {
    return this.core.fetch('/api/v2/offers', 'post', body);
  }

  /**
   * Retrieve all the information, including signatures, needed to fulfill a listing directly
   * onchain.
   *
   * @summary Fulfill Listing
   * @throws FetchError<400, types.GenerateListingFulfillmentDataV21Response400> The request is invalid
   * The order_hash does not exist
   * The chain is not an EVM Chain
   * The protocol_address is not a supported Seaport contract
   * For other error reasons, see the response data.
   */
  generate_listing_fulfillment_data_v2_1(body: types.GenerateListingFulfillmentDataV21BodyParam): Promise<FetchResponse<200, types.GenerateListingFulfillmentDataV21Response200>> {
    return this.core.fetch('/api/v2/listings/fulfillment_data', 'post', body);
  }

  /**
   * Queue a metadata refresh for a specific NFT to update its information from the
   * blockchain.
   *
   * @summary Refresh NFT metadata
   */
  refresh_nft_metadata_1(metadata: types.RefreshNftMetadata1MetadataParam): Promise<FetchResponse<200, types.RefreshNftMetadata1Response200>> {
    return this.core.fetch('/api/v2/chain/{chain}/contract/{address}/nfts/{identifier}/refresh', 'post', metadata);
  }

  /**
   * Get all available traits for a collection with their value counts and data types.
   *
   * @summary Get collection traits
   */
  get_collection_traits(metadata: types.GetCollectionTraitsMetadataParam): Promise<FetchResponse<200, types.GetCollectionTraitsResponse200>> {
    return this.core.fetch('/api/v2/traits/{slug}', 'get', metadata);
  }

  /**
   * Get a single order by its order hash.
   *
   * @summary Get Order
   */
  get_order_1(metadata: types.GetOrder1MetadataParam): Promise<FetchResponse<200, types.GetOrder1Response200>> {
    return this.core.fetch('/api/v2/orders/chain/{chain}/protocol/{protocol_address}/{order_hash}', 'get', metadata);
  }

  /**
   * Get trait offers for a collection with the specified trait(s). Supports single or
   * multiple traits.
   *
   * @summary Get offers (by trait)
   */
  get_offers_collection_trait_1(metadata: types.GetOffersCollectionTrait1MetadataParam): Promise<FetchResponse<200, types.GetOffersCollectionTrait1Response200>> {
    return this.core.fetch('/api/v2/offers/collection/{slug}/traits', 'get', metadata);
  }

  /**
   * Get the best offer for an NFT.
   *
   * @summary Get best offer (by NFT)
   */
  get_best_offer_nft_1(metadata: types.GetBestOfferNft1MetadataParam): Promise<FetchResponse<200, types.GetBestOfferNft1Response200>> {
    return this.core.fetch('/api/v2/offers/collection/{slug}/nfts/{identifier}/best', 'get', metadata);
  }

  /**
   * Get offers for an NFT.
   *
   * @summary Get offers (by NFT)
   */
  get_offers_nft_1(metadata: types.GetOffersNft1MetadataParam): Promise<FetchResponse<200, types.GetOffersNft1Response200>> {
    return this.core.fetch('/api/v2/offers/collection/{slug}/nfts/{identifier}', 'get', metadata);
  }

  /**
   * Get all offers for a collection.
   *
   * @summary Get all offers (by collection)
   */
  list_offers_collection_all_1(metadata: types.ListOffersCollectionAll1MetadataParam): Promise<FetchResponse<200, types.ListOffersCollectionAll1Response200>> {
    return this.core.fetch('/api/v2/offers/collection/{slug}/all', 'get', metadata);
  }

  /**
   * Get collection offers on a collection.
   *
   * @summary Get offers (by collection)
   */
  get_offers_collection(metadata: types.GetOffersCollectionMetadataParam): Promise<FetchResponse<200, types.GetOffersCollectionResponse200>> {
    return this.core.fetch('/api/v2/offers/collection/{slug}', 'get', metadata);
  }

  /**
   * Get detailed metadata for an NFT including name, description, image, traits, and
   * external links.
   *
   * @summary Get NFT metadata
   */
  get_nft_metadata(metadata: types.GetNftMetadataMetadataParam): Promise<FetchResponse<200, types.GetNftMetadataResponse200>> {
    return this.core.fetch('/api/v2/metadata/{chain}/{contractAddress}/{tokenId}', 'get', metadata);
  }

  /**
   * Get the best listing for an NFT.
   *
   * @summary Get best listing (by NFT)
   */
  get_best_listing_nft(metadata: types.GetBestListingNftMetadataParam): Promise<FetchResponse<200, types.GetBestListingNftResponse200>> {
    return this.core.fetch('/api/v2/listings/collection/{slug}/nfts/{identifier}/best', 'get', metadata);
  }

  /**
   * Get the best listings for a collection by price.
   *
   * @summary Get best listings (by collection)
   */
  get_best_listings_collection(metadata: types.GetBestListingsCollectionMetadataParam): Promise<FetchResponse<200, types.GetBestListingsCollectionResponse200>> {
    return this.core.fetch('/api/v2/listings/collection/{slug}/best', 'get', metadata);
  }

  /**
   * Get all listings for a collection.
   *
   * @summary Get all listings (by collection)
   */
  list_listings_collection_all_1(metadata: types.ListListingsCollectionAll1MetadataParam): Promise<FetchResponse<200, types.ListListingsCollectionAll1Response200>> {
    return this.core.fetch('/api/v2/listings/collection/{slug}/all', 'get', metadata);
  }

  /**
   * Get a list of events for a collection.
   *
   * @summary Get events (by collection)
   */
  list_events_by_collection(metadata: types.ListEventsByCollectionMetadataParam): Promise<FetchResponse<200, types.ListEventsByCollectionResponse200>> {
    return this.core.fetch('/api/v2/events/collection/{slug}', 'get', metadata);
  }

  /**
   * Get a list of events for a specific NFT.
   *
   * @summary Get events (by NFT)
   */
  list_events_by_nft_1(metadata: types.ListEventsByNft1MetadataParam): Promise<FetchResponse<200, types.ListEventsByNft1Response200>> {
    return this.core.fetch('/api/v2/events/chain/{chain}/contract/{address}/nfts/{identifier}', 'get', metadata);
  }

  /**
   * Get a list of events for an account.
   *
   * @summary Get events (by account)
   */
  list_events_by_account_1(metadata: types.ListEventsByAccount1MetadataParam): Promise<FetchResponse<200, types.ListEventsByAccount1Response200>> {
    return this.core.fetch('/api/v2/events/accounts/{address}', 'get', metadata);
  }

  /**
   * Get a list of events, with optional filtering by event type and time range.
   *
   * @summary Get events
   */
  list_events_1(metadata?: types.ListEvents1MetadataParam): Promise<FetchResponse<200, types.ListEvents1Response200>> {
    return this.core.fetch('/api/v2/events', 'get', metadata);
  }

  /**
   * Get a list of collections with filters and sorting options.
   *
   * @summary Get multiple collections
   */
  list_collections(metadata?: types.ListCollectionsMetadataParam): Promise<FetchResponse<200, types.ListCollectionsResponse200>> {
    return this.core.fetch('/api/v2/collections', 'get', metadata);
  }

  /**
   * Get a single collection including details such as fees, traits, and links.
   *
   * @summary Get a single collection
   */
  get_collection(metadata: types.GetCollectionMetadataParam): Promise<FetchResponse<200, types.GetCollectionResponse200>> {
    return this.core.fetch('/api/v2/collections/{slug}', 'get', metadata);
  }

  /**
   * Get comprehensive statistics for a collection including volume, floor price, and trading
   * metrics.
   *
   * @summary Get collection stats
   */
  get_collection_stats(metadata: types.GetCollectionStatsMetadataParam): Promise<FetchResponse<200, types.GetCollectionStatsResponse200>> {
    return this.core.fetch('/api/v2/collections/{slug}/stats', 'get', metadata);
  }

  /**
   * Get all NFTs in a specific collection.
   *
   * @summary Get NFTs by collection
   */
  get_nfts_by_collection(metadata: types.GetNftsByCollectionMetadataParam): Promise<FetchResponse<200, types.GetNftsByCollectionResponse200>> {
    return this.core.fetch('/api/v2/collection/{slug}/nfts', 'get', metadata);
  }

  /**
   * Get a payment token by chain and contract address.
   *
   * @summary Get payment token
   */
  get_payment_token(metadata: types.GetPaymentTokenMetadataParam): Promise<FetchResponse<200, types.GetPaymentTokenResponse200>> {
    return this.core.fetch('/api/v2/chain/{chain}/payment_token/{address}', 'get', metadata);
  }

  /**
   * Get contract metadata including collection information, contract standards, and
   * ownership details.
   *
   * @summary Get contract
   */
  get_contract(metadata: types.GetContractMetadataParam): Promise<FetchResponse<200, types.GetContractResponse200>> {
    return this.core.fetch('/api/v2/chain/{chain}/contract/{address}', 'get', metadata);
  }

  /**
   * Get the collection that an NFT belongs to. This is useful for multi-contract collections
   * like Art Blocks where the item ID disambiguates which collection the NFT belongs to.
   *
   * @summary Get collection by NFT
   */
  get_nft_collection(metadata: types.GetNftCollectionMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionResponse200>> {
    return this.core.fetch('/api/v2/chain/{chain}/contract/{address}/nfts/{identifier}/collection', 'get', metadata);
  }

  /**
   * Get metadata, traits, ownership information, and rarity for a single NFT.
   *
   * @summary Get NFT
   */
  get_nft_1(metadata: types.GetNft1MetadataParam): Promise<FetchResponse<200, types.GetNft1Response200>> {
    return this.core.fetch('/api/v2/chain/{chain}/contract/{address}/nfts/{identifier}', 'get', metadata);
  }

  /**
   * Get all NFTs for a specific contract address on a blockchain.
   *
   * @summary Get NFTs by contract
   */
  get_nfts_by_contract_1(metadata: types.GetNftsByContract1MetadataParam): Promise<FetchResponse<200, types.GetNftsByContract1Response200>> {
    return this.core.fetch('/api/v2/chain/{chain}/contract/{address}/nfts', 'get', metadata);
  }

  /**
   * Get all NFTs owned by a specific account on a blockchain, with optional collection
   * filtering.
   *
   * @summary Get NFTs by account
   */
  get_nfts_by_account(metadata: types.GetNftsByAccountMetadataParam): Promise<FetchResponse<200, types.GetNftsByAccountResponse200>> {
    return this.core.fetch('/api/v2/chain/{chain}/account/{address}/nfts', 'get', metadata);
  }

  /**
   * Get an OpenSea Account Profile including details such as bio, social media usernames,
   * and profile image.
   *
   * @summary Get an OpenSea Account Profile
   */
  get_account(metadata: types.GetAccountMetadataParam): Promise<FetchResponse<200, types.GetAccountResponse200>> {
    return this.core.fetch('/api/v2/accounts/{address_or_username}', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { BuildOfferV2BodyParam, BuildOfferV2Response200, CancelOrder1BodyParam, CancelOrder1MetadataParam, CancelOrder1Response200, GenerateListingFulfillmentDataV21BodyParam, GenerateListingFulfillmentDataV21Response200, GenerateListingFulfillmentDataV21Response400, GenerateOfferFulfillmentDataV2BodyParam, GenerateOfferFulfillmentDataV2Response200, GenerateOfferFulfillmentDataV2Response400, GetAccountMetadataParam, GetAccountResponse200, GetBestListingNftMetadataParam, GetBestListingNftResponse200, GetBestListingsCollectionMetadataParam, GetBestListingsCollectionResponse200, GetBestOfferNft1MetadataParam, GetBestOfferNft1Response200, GetCollectionMetadataParam, GetCollectionResponse200, GetCollectionStatsMetadataParam, GetCollectionStatsResponse200, GetCollectionTraitsMetadataParam, GetCollectionTraitsResponse200, GetContractMetadataParam, GetContractResponse200, GetListings1MetadataParam, GetListings1Response200, GetNft1MetadataParam, GetNft1Response200, GetNftCollectionMetadataParam, GetNftCollectionResponse200, GetNftMetadataMetadataParam, GetNftMetadataResponse200, GetNftsByAccountMetadataParam, GetNftsByAccountResponse200, GetNftsByCollectionMetadataParam, GetNftsByCollectionResponse200, GetNftsByContract1MetadataParam, GetNftsByContract1Response200, GetOffersCollectionMetadataParam, GetOffersCollectionResponse200, GetOffersCollectionTrait1MetadataParam, GetOffersCollectionTrait1Response200, GetOffersMetadataParam, GetOffersNft1MetadataParam, GetOffersNft1Response200, GetOffersResponse200, GetOrder1MetadataParam, GetOrder1Response200, GetPaymentTokenMetadataParam, GetPaymentTokenResponse200, ListCollectionsMetadataParam, ListCollectionsResponse200, ListEvents1MetadataParam, ListEvents1Response200, ListEventsByAccount1MetadataParam, ListEventsByAccount1Response200, ListEventsByCollectionMetadataParam, ListEventsByCollectionResponse200, ListEventsByNft1MetadataParam, ListEventsByNft1Response200, ListListingsCollectionAll1MetadataParam, ListListingsCollectionAll1Response200, ListOffersCollectionAll1MetadataParam, ListOffersCollectionAll1Response200, PostCriteriaOfferV2BodyParam, PostCriteriaOfferV2Response200, PostListing1BodyParam, PostListing1MetadataParam, PostListing1Response200, PostOfferBodyParam, PostOfferMetadataParam, PostOfferResponse200, RefreshNftMetadata1MetadataParam, RefreshNftMetadata1Response200 } from './types';
