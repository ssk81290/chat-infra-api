
import { Request, Response } from 'express';
import { createLandingPageModel } from '../models/landingPage'; // Landing page model
import { createAccountModel } from '../models/account';
import infraDBConnection from '../utils/infraDBConnection'; // InfraDB connection
import moment from 'moment';
import slugify from 'slugify';

const account = createAccountModel(infraDBConnection);
// Controller Function
export const createLandingPage = async (req: Request, res: Response) => {
  const { account_num, title, content, badge, meta_desc, keywords, track_code, settings, check_urls, menu  } = req.body;

  try {
    // Validate required fields
    if (!account_num || !title || !settings?.sub_domain) {
      return res.status(400).json({ result: 400, error: 'Missing required fields' });
    }

    const accountDetails = await account.findOne({account_num:account_num});
    if(!accountDetails)
    {
      return res.status(400).json({ result: 400, error: 'Invalid account number' });
    }
    const account_id  = accountDetails._id.toString();
    // Default values for optional fields
    const landingPageData = {
      account_num,
      account_id,
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
    const urls = keywordss.map((keyword: string) => `https://${fqdn}/${slugify(keyword,"-")}`);
    urls.push( `https://${fqdn}`);

    landingPageData.urls = urls;
    const LandingPage = createLandingPageModel(infraDBConnection);

    // Create the landing page document
    const newLandingPage = await LandingPage.create(landingPageData);

    // Send response
    res.status(200).json({
      result: 200,
      landing_page: {
        landing_page_id: newLandingPage._id,
        title: newLandingPage.title,
        urls : urls
        
      },
    });
  } catch (error) {
    console.error('Error creating landing page:', error);
    res.status(500).json({ result: 500, error: 'Internal server error' });
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
          title: landingPage.title,
          content: landingPage.content,
          badge: landingPage.badge,
          meta_desc: landingPage.meta_desc,
          keywords: landingPage.keywords,
          track_code: landingPage.track_code,
          urls : landingPage.urls,
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
      if (filter?.status) query.status = filter.status;
      if(filter?.fqdn) query.settings.fqdn = filter.fqdn;
      if (filter?.add_date) {
        query['track.created'] = {
          $gte: moment(filter.add_date.from).toDate(),
          $lte: moment(filter.add_date.to).toDate(),
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
      const sortQuery = sort || { title: 1 };
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
        msg: `Landing Page ${updatedLandingPage.title} is updated.`,
        data: {
          account_id: updatedLandingPage.account_id,
          account_num: updatedLandingPage.account_num,
          title: updatedLandingPage.title,
          urls:updatedLandingPage.urls
        },
      });
    } catch (error) {
      console.error('Error updating landing page:', error);
      res.status(500).json({ result: 500, error: 'Internal server error' });
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
  