import { Request, Response } from 'express';
import { createLandingPageModel } from '../models/landingPage'; // Landing page model
import { createAccountModel } from '../models/account';
import { createCluster } from '../models/Cluster';
import infraDBConnection from '../utils/infraDBConnection'; // InfraDB connection
import moment from 'moment';
import slugify from 'slugify';
import { CONNREFUSED } from 'dns';

const account = createAccountModel(infraDBConnection);
const cluster = createCluster(infraDBConnection);
// Controller Function
export const createLandingPage = async (req: Request, res: Response) => {
  const { cluster_num, account_num, title, content, badge, meta_desc, keywords, track_code, settings, check_urls, menu  } = req.body;

  try {
    // Validate required fields
    if (!account_num || !title || !settings?.sub_domain) {
      return res.status(400).json({ result: 400, error: 'Missing required fields account_num, title, sub_domain'});
    }
    

    const accountDetails = await account.findOne({account_num:account_num});
    if(!accountDetails)
    {
      return res.status(400).json({ result: 400, error: 'Invalid account number' });
    }
    
    const cluster_query: any = {};
    if(!cluster_num)
    { 
      cluster_query.cluster_num = accountDetails.cluster_num; 
    }
    else {
      cluster_query.cluster_num = accountDetails.cluster_num; 
    }
  
    const cluster_details = await cluster.findOne(cluster_query);
    if (!cluster_details) {
      return res.status(400).json({ 
          result: 400, 
          error: 'Invalid cluster',
          msg: 'Could not find cluster details'
      });
  }
    
    const account_id  = accountDetails._id.toString();
    // Default values for optional fields
    const landingPageData = {
      account_num,
      account_id,
      cluster_id : cluster_details?._id,
      cluster_name : cluster_details?.cluster_name,
      cluster_num : cluster_details?.cluster_num,
      flag : cluster_details?.flag || 'default',
      title,
      content: content || '',
      badge: badge || '',
      meta_desc: meta_desc || '',
      keywords: keywords || '',
      track_code: track_code || '',
      check_urls : check_urls,
      urls : [],
      menu : menu,
      settings: {
        sub_domain: settings.sub_domain,
        domain: settings.domain || 'qwickpages.ai',
        fqdn: `${settings.sub_domain}.${settings.domain}`,
        expiry: settings.expiry ? moment(settings.expiry, 'YYYY-MM-DD').toDate() : null,
        theme: settings.theme || 'light'

      },
      track: {
        created: moment().toISOString(),
      },
    };
    
    


    const fqdn = landingPageData.settings?.fqdn || '';
    const keywordss = landingPageData.keywords?.split(',').map((kwd: string) => kwd.trim()) || [];
    const urls = keywordss.map((keyword: string) => slugify(keyword,"-"));

    landingPageData.urls = urls;
    
    const LandingPage = createLandingPageModel(infraDBConnection);
    
    // Create the landing page document
    const newLandingPage = await LandingPage.create(landingPageData);
    // res.status(200).json({
    //   result: 200,
    //   newLandingPage
    // });
    // Send response
    res.status(200).json({
      result: 200,
      landing_page: {
        landing_page_id: newLandingPage._id,
        title: newLandingPage.title,
        urls : urls
        
      },
    });
  } catch (err: any) {
    console.error('Error creating landing page:', err);
    
    // Check if it's a Mongoose ValidationError
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        result: 400,
        error: 'Validation Error',
        details: validationErrors,
        msg: err.message
      });
    }
    // Handle Duplicate Key Error
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyPattern || err.keyValue || {})[0];
      const duplicatedValue = err.keyValue?.[duplicatedField];

      return res.status(409).json({
        result: 409,
        error: 'Duplicate Key Error',
        msg: `Sub domain is already in use. Please choose another.`
      });
    }

    // Handle other types of errors
    return res.status(500).json({ 
      result: 500, 
      error: 'Internal server error',
      msg: err.message || 'Unknown error occurred'
    });
  }
};


export const getLandingPage = async (req: Request, res: Response) => {
  
    const { landing_page_id } = req.params;
  
    try {
      // Connect to the Landing Page model
      const LandingPage = createLandingPageModel(infraDBConnection);
  
      // Find the Landing Page by ID
      const landingPage = await LandingPage.findById(landing_page_id);
  
      if (!landingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: {
            landing_page_id,
          },
        });
      }
  
      // Build the response object
      const response = {
        result: 200,
        landing_page: {
          landing_page_id: landingPage._id,
          account_id: landingPage.account_id,
          account_num: landingPage.account_num,
          account_name: landingPage.account_name,
          chatbot_id: landingPage.chatbot_id,
          chatbot_num: landingPage.chatbot_num,
         
          cluster_name: landingPage.cluster_name,
          cluster_num: landingPage.cluster_num,
          flag: landingPage.flag,
          title: landingPage.title,
          content: landingPage.content,
          badge: landingPage.badge,
          meta_desc: landingPage.meta_desc,
          keywords: landingPage.keywords,
          track_code: landingPage.track_code,
          gtag_code: landingPage.gtag_code,
          clarity_code: landingPage.clarity_code,
          urls : landingPage.urls,
          logo : landingPage.logo,
          url_contents : landingPage.url_contents,
          check_urls : landingPage.check_urls,
          settings: {
            sub_domain: landingPage.settings.sub_domain,
            domain: landingPage.settings.domain,
            fqdn: `${landingPage.settings.sub_domain}.${landingPage.settings.domain}`,
            expiry: landingPage.settings.expiry,
            theme: landingPage.settings.theme,
            cache_expiry : landingPage.settings.cache_expiry
          },
          menu:landingPage.menu,
          status: landingPage.status,
          track: landingPage.track,
        },
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error('Error retrieving landing page:', error);
      res.status(500).json({ result: 500, error: 'Internal server error' });
    }
  };


  export const searchLandingPages = async (req: Request, res: Response) => {
    const { filter, sort, page } = req.body;
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
      
      // Build filter query
      const query: any = {};
      if (filter?.account_num) query.account_num = filter.account_num;
      if (filter?.chatbot_num) query.chatbot_num = filter.chatbot_num;
      if (filter?.cluster_num) query.cluster_num = filter.cluster_num;
      if (filter?.status) query.status = filter.status;
      if(filter?.fqdn) query.settings.fqdn = filter.fqdn;
      if (filter?.add_date) {
        query['track.created'] = {
          $gte: moment(filter.add_date.from).toDate(),
          $lte: moment(filter.add_date.to).toDate(),
        };
      }
      if (filter?.title) {
        query['title'] = {
          $regex: filter.title,
          $options: 'i' // case-insensitive
        };
      }
  
      if (filter?.suspend_date) {
        query['track.suspended'] = {
          $gte: moment(filter.suspend_date.from).toDate(),
          $lte: moment(filter.suspend_date.to).toDate(),
        };
      }
  
      if (filter?.expiry_date) {
        query['settings.expiry'] = {
          $gte: moment(filter.expiry_date.from).toDate(),
          $lte: moment(filter.expiry_date.to).toDate(),
        };
      }
  
      // Pagination and Sorting
      const sortQuery = sort || { 'track.created': -1 };
      const pageLength = page?.length || 20;
      const pageNum = page?.num || 1;
      //console.log(query);
      const [landingPages, total] = await Promise.all([
        LandingPage.find(query)
          .sort(sortQuery)
          .skip((pageNum - 1) * pageLength)
          .limit(pageLength),
        LandingPage.countDocuments(query),
      ]);
     // console.log(landingPages);
    //   const landingPagesWithUrls = landingPages.map((page) => {
    //   const fqdn = page.settings?.fqdn || '';
    //   const keywords = page.keywords?.split(',').map((kw) => kw.trim()) || [];
    //   const urls = keywords.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
    //   urls.push( `https://${fqdn}`);
    //   return {
    //     ...page.toObject(),
    //     urls,
    //   };
    // });

    res.status(200).json({
      result: 200,
      page_length: pageLength,
      page_num: pageNum,
      total,
      landing_pages: landingPages,
    });
    } catch (error) {
      console.error('Error searching landing pages:', error);
      res.status(500).json({ result: 500, error: 'Internal server error' });
    }
  };

  export const updateLandingPage = async (req: Request, res: Response) => {
    const { landing_page_id } = req.params;
    const updates = req.body;
  
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
      
      // Remove immutable fields
      delete updates.track?.created;
      delete updates._id;
      delete updates.account_id;
      delete updates.account_num;
      delete updates.cluster_id;
      delete updates.cluster_name;
      delete updates.cluster_num;
      delete updates.flag;
      delete updates.settings;

      // Add modified timestamp
      updates['track.modified'] = moment().toISOString();

      // If keywords are provided, update urls
      if (updates.keywords) {
        const keywordss = updates.keywords.split(',').map((kwd: string) => kwd.trim());
        updates.urls = keywordss.map((keyword: string) => slugify(keyword,"-"));
      }
      if (!updates.logo) {
          updates.logo = '';
      }
      if (updates.fqdn) {
         updates['settings.fqdn'] = updates.fqdn;
      }
  
      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landing_page_id,
        { $set: updates },
        { new: true }
      );
      
      if (!updatedLandingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: { landing_page_id },
        });
      }
  
      res.status(200).json({
        result: 200,
        msg: `Landing Page ${updatedLandingPage.title} is updated.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          title: updatedLandingPage.title,
          content: updatedLandingPage.content,
          meta_desc: updatedLandingPage.meta_desc,
          keywords: updatedLandingPage.keywords,
          badge: updatedLandingPage.badge,
          menu: updatedLandingPage.menu,
          logo: updatedLandingPage.logo,
          urls: updatedLandingPage.urls,
          url_contents: updatedLandingPage.url_contents,
          check_urls: updatedLandingPage.check_urls
        },
      });
    } catch (error) {
      console.error('Error updating landing page:', error);
      res.status(500).json({ result: 500, error: error});
    }
  };
  export const updateLandingPageSlug = async (req: Request, res: Response) => {
    const { landing_page_id } = req.params;
    const newContent = req.body;
  
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
      
      // Get the current landing page
      const landingPage = await LandingPage.findById(landing_page_id);
      
      if (!landingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: { landing_page_id },
        });
      }

      // Validate the new content format
      if (typeof newContent !== 'object' || newContent === null) {
        return res.status(400).json({
          result: 400,
          error: 'Invalid content format',
          msg: 'Content must be an object with a key and content field'
        });
      }

      // Get the key from the new content and slugify it
      const rawKey = Object.keys(newContent).find(key => key !== 'check_urls');
      if (!rawKey || !newContent[rawKey]?.content) {
        return res.status(400).json({
          result: 400,
          error: 'Invalid content structure',
          msg: 'Content must have a key with a content field'
        });
      }

      const newKey = slugify(rawKey, "-");

      // Check for duplicate key in existing url_contents
      const existingKey = landingPage.url_contents?.some(item => 
        Object.keys(item)[0] === newKey
      );

      if (existingKey) {
        return res.status(400).json({
          result: 400,
          error: 'Duplicate key',
          msg: `Key "${newKey}" already exists in url_contents`
        });
      }

      // Create simplified content object with slugified key
      const simplifiedContent = {
        [newKey]: {
          content: newContent[rawKey].content
        }
      };

      // Prepare updates object
      const updates: any = {
        $push: { url_contents: simplifiedContent }
      };

      // Add check_urls update if present in payload
      if ('check_urls' in newContent) {
        updates.$set = {
          check_urls: newContent.check_urls
        };
      }

      updates['track.modified'] = moment().toISOString();

      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landing_page_id,
        updates,
        { new: true }
      );

      if (!updatedLandingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found after update',
          desc: 'Failed to update the landing page.',
          data: { landing_page_id },
        });
      }
  
      res.status(200).json({
        result: 200,
        msg: `URL content added for Landing Page ${updatedLandingPage.title}.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          title: updatedLandingPage.title,
          urls: updatedLandingPage.urls,
          url_contents: updatedLandingPage.url_contents,
          check_urls: updatedLandingPage.check_urls
        },
      });
    } catch (error) {
      console.error('Error updating landing page URL content:', error);
      res.status(500).json({ result: 500, error: error });
    }
  };
  export const updateLandingPageSlugContent = async (req: Request, res: Response) => {
    const { landing_page_id } = req.params;
    const newContent = req.body;
  
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
      
      // Get the current landing page
      const landingPage = await LandingPage.findById(landing_page_id);
      
      if (!landingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: { landing_page_id },
        });
      }

      // Validate the new content format
      if (typeof newContent !== 'object' || newContent === null) {
        return res.status(400).json({
          result: 400,
          error: 'Invalid content format',
          msg: 'Content must be an object with a key and content field'
        });
      }

      // Get the key from the new content
      const newKey = Object.keys(newContent)[0];
      if (!newKey || !newContent[newKey]?.content) {
        return res.status(400).json({
          result: 400,
          error: 'Invalid content structure',
          msg: 'Content must have a key with a content field'
        });
      }

      // Check if the key exists in url_contents
      const keyExists = landingPage.url_contents?.some(item => 
        Object.keys(item)[0] === newKey
      );

      if (!keyExists) {
        return res.status(400).json({
          result: 400,
          error: 'Key not found',
          msg: `Key "${newKey}" does not exist in url_contents`
        });
      }

      // Update the content for the existing key
      const updates: any = {
        $set: {
          [`url_contents.$[elem].${newKey}.content`]: newContent[newKey].content
        }
      };
      updates['track.modified'] = moment().toISOString();

      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landing_page_id,
        updates,
        { 
          new: true,
          arrayFilters: [{ [`elem.${newKey}`]: { $exists: true } }]
        }
      );

      if (!updatedLandingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found after update',
          desc: 'Failed to update the landing page.',
          data: { landing_page_id },
        });
      }

      // Double check if the update was successful
      const verifyUpdate = await LandingPage.findById(landing_page_id);
      const contentUpdated = verifyUpdate?.url_contents?.some(item => 
        Object.keys(item)[0] === newKey && 
        item[Object.keys(item)[0]].content === newContent[newKey].content
      );

      if (!contentUpdated) {
        // Try alternative update method
        const alternativeUpdate = await LandingPage.findByIdAndUpdate(
          landing_page_id,
          {
            $set: {
              url_contents: landingPage.url_contents.map(item => {
                const key = Object.keys(item)[0];
                if (key === newKey) {
                  return {
                    [key]: {
                      content: newContent[newKey].content
                    }
                  };
                }
                return item;
              })
            }
          },
          { new: true }
        );

        if (!alternativeUpdate) {
          return res.status(500).json({
            result: 500,
            error: 'Update verification failed',
            msg: 'Failed to update the content'
          });
        }

        return res.status(200).json({
          result: 200,
          msg: `URL content updated for Landing Page ${alternativeUpdate.title}.`,
          data: {
            account_id: alternativeUpdate.account_id,
            account_num: alternativeUpdate.account_num,
            title: alternativeUpdate.title,
            urls: alternativeUpdate.urls,
            url_contents: alternativeUpdate.url_contents
          },
        });
      }
  
      res.status(200).json({
        result: 200,
        msg: `URL content updated for Landing Page ${updatedLandingPage.title}.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          title: updatedLandingPage.title,
          urls: updatedLandingPage.urls,
          url_contents: updatedLandingPage.url_contents
        },
      });
    } catch (error) {
      console.error('Error updating landing page URL content:', error);
      res.status(500).json({ result: 500, error: error });
    }
  };

  export const updateLandingPageStatus = async (req: Request, res: Response) => {
    const { landing_page_id } = req.params;
    const { status } = req.body;
  
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
  
      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landing_page_id,
        { status, 'track.modified': moment().toISOString() },
        { new: true }
      );
  
      if (!updatedLandingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: { landing_page_id },
        });
      }
   
      // const fqdn = updatedLandingPage.settings?.fqdn || '';
      // const keywordss = updatedLandingPage.keywords?.split(',').map((kwd) => kwd.trim()) || [];
      // const urls = keywordss.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
      // urls.push( `https://${fqdn}`);

      res.status(200).json({
        result: 200,
        msg: `Landing Page ${updatedLandingPage.title} is ${status}.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          status,
          title: updatedLandingPage.title,
          urls : updatedLandingPage.urls
        },
      });
    } catch (error) {
      console.error('Error updating landing page status:', error);
      res.status(500).json({ result: 500, error: 'Internal server error' });
    }
  };

  export const updateLandingPageChatbot = async (req: Request, res: Response) => {
    const { landing_page_id } = req.params;
    const { chatbot_num } = req.body;
  
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
      const Chatbot = infraDBConnection.model('Chatbot'); // Assuming Chatbot model exists
  
      const chatbot = await Chatbot.findOne({ chatbot_num });
      if (!chatbot) {
        return res.status(404).json({
          result: 404,
          error: 2009,
          msg: 'Chatbot not found',
          desc: 'Specified Chatbot is invalid.',
          data: { chatbot_num },
        });
      }
  
      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landing_page_id,
        {
          chatbot_id: chatbot._id,
          chatbot_num: chatbot.chatbot_num,
          'track.modified': moment().toISOString(),
        },
        { new: true }
      );
  
      if (!updatedLandingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: { landing_page_id },
        });
      }
      // Update chatbot with landing page info using the same structure
      await Chatbot.findByIdAndUpdate(
        chatbot._id,
        {
          landing_page_id: landing_page_id,
          'track.modified': moment().toISOString(),
        },
        { new: true }
      );
      // const fqdn = updatedLandingPage.settings?.fqdn || '';
      // const keywordss = updatedLandingPage.keywords?.split(',').map((kwd) => kwd.trim()) || [];
      // const urls = keywordss.map((keyword) => `https://${fqdn}/${slugify(keyword,"-")}`);
      // urls.push( `https://${fqdn}`);
  
      res.status(200).json({
        result: 200,
        msg: `Chatbot is updated for Landing Page ${updatedLandingPage.title}.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          chatbot_id: chatbot._id,
          chatbot_num: chatbot.chatbot_num,
          title: updatedLandingPage.title,
          urls : updatedLandingPage.urls
        },
      });
    } catch (error) {
      console.error('Error updating landing page chatbot:', error);
      res.status(500).json({ result: 500, error: 'Internal server error' });
    }
  };

  export const deleteLandingPageSlug = async (req: Request, res: Response) => {
    const { landing_page_id } = req.params;
    const { slug } = req.body;
  
    try {
      const LandingPage = createLandingPageModel(infraDBConnection);
      
      // Get the current landing page
      const landingPage = await LandingPage.findById(landing_page_id);
      
      if (!landingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found',
          desc: 'Specified Landing Page is invalid.',
          data: { landing_page_id },
        });
      }

      // Validate the slug
      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({
          result: 400,
          error: 'Invalid slug',
          msg: 'Slug must be a string'
        });
      }

      // Check if the slug exists in url_contents
      const slugExists = landingPage.url_contents?.some(item => 
        Object.keys(item)[0] === slug
      );

      if (!slugExists) {
        return res.status(400).json({
          result: 400,
          error: 'Slug not found',
          msg: `Slug "${slug}" does not exist in url_contents`
        });
      }

      // Update the landing page by removing the item with matching slug
      const updates: any = {
        $pull: {
          url_contents: {
            [slug]: { $exists: true }
          }
        }
      };
      updates['track.modified'] = moment().toISOString();

      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landing_page_id,
        updates,
        { new: true }
      );

      if (!updatedLandingPage) {
        return res.status(404).json({
          result: 404,
          error: 2008,
          msg: 'Landing Page not found after update',
          desc: 'Failed to update the landing page.',
          data: { landing_page_id },
        });
      }

      // Verify the deletion
      const verifyDeletion = await LandingPage.findById(landing_page_id);
      const stillExists = verifyDeletion?.url_contents?.some(item => 
        Object.keys(item)[0] === slug
      );

      if (stillExists) {
        return res.status(500).json({
          result: 500,
          error: 'Deletion verification failed',
          msg: 'Failed to delete the slug'
        });
      }
  
      res.status(200).json({
        result: 200,
        msg: `URL content deleted for Landing Page ${updatedLandingPage.title}.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          title: updatedLandingPage.title,
          urls: updatedLandingPage.urls,
          url_contents: updatedLandingPage.url_contents
        },
      });
    } catch (error) {
      console.error('Error deleting landing page URL content:', error);
      res.status(500).json({ result: 500, error: error });
    }
  };

  export const checkSubdomainAvailability = async (req: Request, res: Response) => {
    const { account_num, sub_domain } = req.body;

    try {
      // Validate required fields
      if (!account_num || !sub_domain ) {
        return res.status(400).json({
          result: 400,
          error: 'Missing required fields',
          msg: 'account_num and sub_domain are required'
        });
      }

      const LandingPage = createLandingPageModel(infraDBConnection);

      // Check if any landing page exists with the given subdomain and domain for the account
      const existingPage = await LandingPage.findOne({
        account_num,
        'settings.sub_domain': sub_domain
      });
      res.status(200).json({
        result: 200,
        available: !existingPage,
        msg: existingPage ? 'Subdomain is already in use' : 'Subdomain is available'
      });

    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      res.status(500).json({ result: 500, error: 'Internal server error' });
    }
  };
  